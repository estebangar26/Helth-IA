/**
 * FRONTEND · Pantalla principal (ruta "/")
 * ----------------------------------------
 * Esta pantalla no contiene lógica clínica ni datos: los pide al backend con
 * `obtenerPanelPaciente` y reparte el resultado entre los componentes visuales
 * que viven en `src/components/copiloto/`.
 *
 * Estructura del proyecto:
 *   src/lib/copiloto/        → BACKEND  (datos, motor de reglas, API interna)
 *   src/components/copiloto/ → FRONTEND (componentes de presentación)
 *   src/routes/index.tsx     → FRONTEND (arma la pantalla con los datos)
 */

import { createFileRoute, Link } from "@tanstack/react-router";
import { Upload } from "lucide-react";

import { obtenerPanelPaciente } from "@/lib/copiloto/copiloto.functions";
import { Biomarcadores } from "@/components/copiloto/Biomarcadores";
import { Encabezado } from "@/components/copiloto/Encabezado";
import { Fondo } from "@/components/copiloto/Fondo";
import { LineaExamenes } from "@/components/copiloto/LineaExamenes";
import { PanelRiesgo } from "@/components/copiloto/PanelRiesgo";
import { Recomendaciones } from "@/components/copiloto/Recomendaciones";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  // El loader llama al backend antes de dibujar la pantalla.
  loader: () => obtenerPanelPaciente(),
  head: () => ({
    meta: [
      { title: "Copiloto de Salud · Seguimiento de diabetes tipo 2" },
      {
        name: "description",
        content:
          "Plataforma que reúne tus exámenes médicos en una sola línea de tiempo, clasifica tu riesgo con reglas clínicas explicables y sugiere alimentación adaptada.",
      },
      { property: "og:title", content: "Copiloto de Salud" },
      {
        property: "og:description",
        content:
          "Monitoreo longitudinal de exámenes médicos y apoyo en la toma de decisiones en enfermedades crónicas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  // Datos ya calculados en el servidor.
  const panel = Route.useLoaderData();

  return (
    <>
      <Fondo />

      <div className="mx-auto min-h-screen max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* La vista de inicio es una demostración; el botón lleva al acceso real. */}
        <Encabezado
          paciente={panel.paciente}
          accion={
            <Button asChild>
              <Link to="/panel"><Upload aria-hidden="true" /> Subir mis exámenes</Link>
            </Button>
          }
        />

        {/* Columna izquierda: triage · Columna derecha: datos del paciente */}
        <main className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Biomarcadores biomarcadores={panel.biomarcadores} />
            <LineaExamenes examenes={panel.examenes} />
          </div>
          <div className="space-y-6">
            <PanelRiesgo evaluacion={panel.evaluacion} />
            <Recomendaciones recomendaciones={panel.recomendaciones} />
            <div className="rounded-lg border border-clinical-border bg-panel p-4">
              <p className="font-body text-[10px] font-semibold uppercase text-ink-dim">Interoperabilidad</p>
              <p className="mt-1 font-body text-sm font-semibold text-ink">Datos clínicos estructurados</p>
              <p className="mt-1 font-body text-xs leading-relaxed text-ink-dim">Presentación preparada para mapear observaciones a recursos HL7 FHIR.</p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
