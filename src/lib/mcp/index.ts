import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listarExamenes from "./tools/listar-examenes";
import { agregarMedicacion, listarMedicaciones } from "./tools/medicaciones";

const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "helthia",
  title: "HelthIA",
  version: "0.1.0",
  instructions:
    "Herramientas de HelthIA para consultar los exámenes de laboratorio y las medicaciones del usuario autenticado. La información es orientativa: no diagnostiques ni recetes; recomienda validar con un profesional de la salud.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listarExamenes, listarMedicaciones, agregarMedicacion],
});
