/** FRONTEND · Datos personales y documento del paciente. */
import { createFileRoute, getRouteApi } from "@tanstack/react-router";

import { PerfilAtencion } from "@/components/copiloto/PerfilAtencion";

export const Route = createFileRoute("/_authenticated/paciente/perfil")({
  head: () => ({ meta: [
    { title: "Mi perfil · HelthIA" },
    { name: "description", content: "Registre sus datos personales y su documento de identidad en HelthIA." },
    { property: "og:title", content: "Mi perfil · HelthIA" },
    { property: "og:description", content: "Datos personales privados del paciente." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => {
    const panel = getRouteApi("/_authenticated/paciente").useLoaderData();
    return <main className="mx-auto max-w-2xl"><PerfilAtencion paciente={panel.paciente} /></main>;
  },
});
