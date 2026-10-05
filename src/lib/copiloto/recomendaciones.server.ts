/**
 * BACKEND · Recomendaciones nutricionales con IA (solo orientación).
 * Se generan una sola vez al guardar el examen para no gastar créditos en cada
 * visita. La IA no decide el riesgo: recibe el resultado de las reglas clínicas.
 */
import { obtenerRecomendaciones } from "./datos.server";

const INSTRUCCION = `Eres el asistente nutricional de HelthIA, plataforma colombiana de prevención en salud.
Das orientación informativa, cálida y sencilla, con alimentos colombianos accesibles.
Nunca diagnostiques, no afirmes que la persona tiene una enfermedad, no recetes ni cambies medicamentos o tratamientos.
Si faltan datos, dilo. Responde SOLO un JSON: {"recomendaciones":[string,string,string]} (máx. 160 caracteres cada una).`;

export async function generarRecomendaciones(
  valores: Record<string, number | null>,
  riesgo: string,
  edad: number | null,
): Promise<string[]> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return obtenerRecomendaciones();
  const datos = Object.entries(valores).filter(([, v]) => v != null).map(([k, v]) => `${k}: ${v}`).join(", ");
  try {
    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3.8-flash",
        messages: [
          { role: "system", content: INSTRUCCION },
          { role: "user", content: `Edad: ${edad ?? "desconocida"}. Riesgo según reglas: ${riesgo}. Valores: ${datos || "sin datos"}.` },
        ],
      }),
    });
    if (!r.ok) return obtenerRecomendaciones();
    const texto: string = (await r.json()).choices?.[0]?.message?.content ?? "";
    const json = JSON.parse(texto.slice(texto.indexOf("{"), texto.lastIndexOf("}") + 1));
    const lista = (json.recomendaciones as unknown[]).filter((t): t is string => typeof t === "string").slice(0, 3);
    return lista.length ? lista : obtenerRecomendaciones();
  } catch {
    return obtenerRecomendaciones();
  }
}
