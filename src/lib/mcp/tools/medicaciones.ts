import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export const listarMedicaciones = defineTool({
  name: "listar_medicaciones",
  title: "Listar mis medicaciones",
  description: "Lista los medicamentos registrados por el usuario con dosis y frecuencia.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_a, ctx) => {
    const { data, error } = await supabaseForUser(ctx).from("medicaciones").select("id,nombre,dosis,frecuencia,notas").eq("user_id", ctx.getUserId()!).order("creado_en", { ascending: false });
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const medicaciones = (data ?? []).map((m) => ({ ...m }));
    return { content: [{ type: "text", text: JSON.stringify(medicaciones) }], structuredContent: { medicaciones } };
  },
});

export const agregarMedicacion = defineTool({
  name: "agregar_medicacion",
  title: "Agregar medicación",
  description: "Registra un medicamento en la lista del usuario.",
  inputSchema: {
    nombre: z.string().trim().min(2).max(120),
    dosis: z.string().trim().max(80).optional(),
    frecuencia: z.string().trim().max(80).optional(),
    notas: z.string().trim().max(300).optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ nombre, dosis, frecuencia, notas }, ctx) => {
    const { error } = await supabaseForUser(ctx).from("medicaciones").insert({ user_id: ctx.getUserId()!, nombre, dosis: dosis || null, frecuencia: frecuencia || null, notas: notas || null });
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return { content: [{ type: "text", text: `Medicamento "${nombre}" registrado.` }] };
  },
});
