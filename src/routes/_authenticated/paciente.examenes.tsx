/** FRONTEND · Registro de archivos y línea de tiempo del paciente. */

import { createFileRoute, getRouteApi, useRouter } from "@tanstack/react-router";

import { LineaExamenes } from "@/components/copiloto/LineaExamenes";
import { SubirExamen } from "@/components/copiloto/SubirExamen";

export const Route = createFileRoute("/_authenticated/paciente/examenes")({
  head: () => ({ meta: [
    { title: "Mis exámenes · HelthIA" },
    { name: "description", content: "Registro de archivos de laboratorio e historial clínico del paciente." },
    { property: "og:title", content: "Mis exámenes · HelthIA" },
    { property: "og:description", content: "Carga e historial privado de exámenes de laboratorio." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Examenes,
});

function Examenes() {
  const panel = getRouteApi("/_authenticated/paciente").useLoaderData();
  const router = useRouter();

  return (
    <main>
      <SubirExamen onGuardado={() => router.invalidate()} />
      {panel.examenes.length > 0 ? (
        <LineaExamenes examenes={panel.examenes} />
      ) : (
        <p className="rounded-lg border border-dashed border-clinical-border bg-panel p-6 font-body text-sm text-ink-dim">
          Todavía no hay exámenes registrados. Suba un archivo para iniciar su línea de tiempo.
        </p>
      )}
    </main>
  );
}