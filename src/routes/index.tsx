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

import { createFileRoute } from "@tanstack/react-router";

import { obtenerPanelPaciente } from "@/lib/copiloto/copiloto.functions";
import { Biomarcadores } from "@/components/copiloto/Biomarcadores";
import { Encabezado } from "@/components/copiloto/Encabezado";
import { Fondo } from "@/components/copiloto/Fondo";
import { LineaExamenes } from "@/components/copiloto/LineaExamenes";
import { PanelRiesgo } from "@/components/copiloto/PanelRiesgo";
import { Recomendaciones } from "@/components/copiloto/Recomendaciones";

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

      <div className="mx-auto min-h-screen max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <Encabezado paciente={panel.paciente} />

        {/* Columna izquierda: triage · Columna derecha: datos del paciente */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          <PanelRiesgo evaluacion={panel.evaluacion} />

          <main>
            <Biomarcadores biomarcadores={panel.biomarcadores} />
            <LineaExamenes examenes={panel.examenes} />
            <Recomendaciones recomendaciones={panel.recomendaciones} />
          </main>
        </div>
      </div>
    </>
  );
}
