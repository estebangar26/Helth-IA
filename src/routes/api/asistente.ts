/** BACKEND · Asistente HelthIA: guía de navegación y orientación general por síntomas (streaming). */
import { createFileRoute } from "@tanstack/react-router";
import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

import { createLovableAiGatewayRunIdFetch, getLovableAiGatewayRunId, withLovableAiGatewayRunIdHeader } from "@/lib/asistente/run-id";

const INSTRUCCIONES = `Eres el asistente de HelthIA, una plataforma colombiana de seguimiento de exámenes de laboratorio (diabetes tipo 1 y 2, diabetes insípida, marcadores de cáncer y testosterona). Respondes siempre en español, con frases cortas y claras.

Ayudas a navegar el sitio:
- Inicio (/): presentación y tienda de dispositivos de monitoreo.
- Servicios (/servicios): qué ofrece la plataforma.
- Ingresar o crear cuenta (/auth).
- En el espacio del paciente: Inicio (/paciente), Mi perfil (/paciente/perfil, hay que registrar el documento antes de subir exámenes), Exámenes (/paciente/examenes, subir PDF o foto), Resultados (/paciente/resultados), Recomendaciones (/paciente/recomendaciones), Medicaciones (/paciente/medicaciones) y Especialistas (/paciente/especialistas, solo atención privada).
- Desde el inicio del paciente se puede invitar al médico por correo para que vea los exámenes.
Cuando menciones una sección, incluye un enlace markdown, por ejemplo [Exámenes](/paciente/examenes).

Sobre síntomas: das orientación general y educativa (hábitos, alimentación con ejemplos colombianos, qué exámenes podría conversar con su médico, qué tipo de especialista consultar). NUNCA diagnosticas, no recetas medicamentos ni dosis y no reemplazas al médico. Si la persona describe señales de alarma (dolor en el pecho, dificultad para respirar, desmayo, confusión, debilidad de un lado del cuerpo, sangrado abundante, ideas de hacerse daño, glucosa muy alta o muy baja con síntomas), indícale que busque urgencias de inmediato o llame a la línea 123. Termina las respuestas sobre salud recordando que la información es orientativa y debe validarla un profesional.`;

export const Route = createFileRoute("/api/asistente")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env['LOVABLE_API_KEY'];
        if (!apiKey) return new Response("Asistente no configurado", { status: 500 });
        const body = (await request.json().catch(() => null)) as { messages?: UIMessage[] } | null;
        const messages = Array.isArray(body?.messages) ? body.messages.slice(-30) : null;
        if (!messages?.length) return new Response("Solicitud inválida", { status: 400 });

        const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
        const provider = createOpenAI({
          baseURL: "https://ai.gateway.lovable.dev/v1",
          apiKey,
          headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
          fetch: runIdFetch.fetch,
        });
        const result = streamText({
          model: provider.responses("openai/gpt-6-astra"),
          instructions: INSTRUCCIONES,
          messages: await convertToModelMessages(messages),
          abortSignal: request.signal,
          providerOptions: {
            openai: { store: false, forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", include: ["reasoning.encrypted_content"] },
          },
        });
        return withLovableAiGatewayRunIdHeader(
          result.toUIMessageStreamResponse({
            originalMessages: messages,
            onError: (e) => {
              const s = (e as { statusCode?: number })?.statusCode;
              if (s === 429) return "Hay muchas consultas en este momento. Intente de nuevo en un minuto.";
              if (s === 402 || s === 403) return "El asistente no está disponible por ahora.";
              return "No se pudo generar la respuesta. Intente de nuevo.";
            },
          }),
          runIdFetch,
        );
      },
    },
  },
});
