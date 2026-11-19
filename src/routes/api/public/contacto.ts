import { createFileRoute } from "@tanstack/react-router";

import { contactoSchema } from "@/lib/contacto/esquema";

const CORREO_PROPIETARIO = "estebangarcia2604@gmail.com";

/** BACKEND · Registra una PQRS privada y avisa al propietario con una plantilla fija. */
export const Route = createFileRoute("/api/public/contacto")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let entrada: unknown;
        try {
          entrada = await request.json();
        } catch {
          return Response.json({ error: "El mensaje no tiene un formato válido." }, { status: 400 });
        }

        const valido = contactoSchema.safeParse(entrada);
        if (!valido.success) {
          return Response.json({ error: valido.error.issues[0]?.message ?? "Revisa los datos." }, { status: 400 });
        }

        const { website: _website, ...datos } = valido.data;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: registro, error } = await supabaseAdmin
          .from("contact_submissions")
          .insert(datos)
          .select("id")
          .single();

        if (error || !registro) {
          console.error("No se pudo registrar el contacto", error?.message);
          return Response.json({ error: "No pudimos registrar tu mensaje. Inténtalo de nuevo." }, { status: 500 });
        }

        try {
          const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
          const envio = await sendTemplateEmail("pqrs-contacto", CORREO_PROPIETARIO, {
            templateData: { ...datos, radicado: registro.id.slice(0, 8).toUpperCase() },
            idempotencyKey: `pqrs-contacto-${registro.id}`,
            replyTo: datos.email,
          });

          if (envio.sent) {
            await supabaseAdmin.from("contact_submissions").update({ owner_notified_at: new Date().toISOString() }).eq("id", registro.id);
            return Response.json({ id: registro.id, avisoEnviado: true }, { status: 201 });
          }

          return Response.json({ id: registro.id, avisoEnviado: false }, { status: 201 });
        } catch (falla) {
          console.error("Contacto guardado; falló el aviso al propietario", falla instanceof Error ? falla.message : "Error desconocido");
          return Response.json({ id: registro.id, avisoEnviado: false }, { status: 201 });
        }
      },
    },
  },
});
