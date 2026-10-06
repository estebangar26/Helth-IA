import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "listar_examenes",
  title: "Listar mis exámenes",
  description: "Lista los exámenes de laboratorio del usuario con sus valores principales, del más reciente al más antiguo.",
  inputSchema: { limite: z.number().int().min(1).max(50).optional().describe("Máximo de exámenes (por defecto 10).") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limite }, ctx) => {
    const { data, error } = await supabaseForUser(ctx)
      .from("examenes")
      .select("id,titulo,laboratorio,fecha,tipo_examen,glucemia_ayunas,hba1c,psa,ca125,ca19_9,cea,afp,testosterona_total,testosterona_libre,sodio,validado_en,created_at")
      .eq("user_id", ctx.getUserId()!)
      .order("created_at", { ascending: false })
      .limit(limite ?? 10);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const examenes = (data ?? []).map((e) => ({ ...e }));
    return {
      content: [{ type: "text", text: JSON.stringify(examenes) + "\nAviso: información orientativa; debe validarla un profesional de la salud." }],
      structuredContent: { examenes },
    };
  },
});
