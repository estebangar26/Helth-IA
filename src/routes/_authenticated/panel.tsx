import { createFileRoute, redirect } from "@tanstack/react-router";
import { obtenerMiRol } from "@/lib/copiloto/roles.functions";

export const Route = createFileRoute("/_authenticated/panel")({
  head: () => ({ meta: [
    { title: "Redirigiendo · HelthIA" },
    { name: "description", content: "Acceso al espacio del paciente de HelthIA." },
    { property: "og:title", content: "Espacio del paciente · HelthIA" },
    { property: "og:description", content: "Acceso seguro al seguimiento clínico." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  beforeLoad: async () => {
    const rol = await obtenerMiRol();
    throw redirect({ to: rol === "admin" ? "/admin" : rol === "medico" ? "/medico" : "/paciente", replace: true });
  },
});