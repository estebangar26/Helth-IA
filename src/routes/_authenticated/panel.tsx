/**
 * FRONTEND · Panel del paciente con sus exámenes reales (ruta "/panel")
 * ---------------------------------------------------------------------
 * Solo se ve con sesión activa. Pide los datos al backend y permite registrar
 * un examen nuevo; al guardarlo, la línea de tiempo se actualiza sola.
 */

import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { obtenerMiPanel } from "@/lib/copiloto/examenes.functions";
import { Biomarcadores } from "@/components/copiloto/Biomarcadores";
import { Encabezado } from "@/components/copiloto/Encabezado";
import { Fondo } from "@/components/copiloto/Fondo";
import { LineaExamenes } from "@/components/copiloto/LineaExamenes";
import { PanelRiesgo } from "@/components/copiloto/PanelRiesgo";
import { Recomendaciones } from "@/components/copiloto/Recomendaciones";
import { SubirExamen } from "@/components/copiloto/SubirExamen";

export const Route = createFileRoute("/_authenticated/panel")({
  // El loader corre bajo la capa protegida, así que ya hay sesión.
  loader: () => obtenerMiPanel(),
  head: () => ({
    meta: [
      { title: "Mi panel · Copiloto de Salud" },
      {
        name: "description",
        content:
          "Registre sus exámenes de laboratorio y vea su riesgo, sus biomarcadores y su línea de tiempo clínica.",
      },
      { property: "og:title", content: "Mi panel del Copiloto de Salud" },
      {
        property: "og:description",
        content: "Exámenes propios, biomarcadores y clasificación de riesgo explicable.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  errorComponent: ({ error }) => (
    <div role="alert" className="mx-auto max-w-md px-4 py-16 text-center">
      <p className="font-display text-lg font-semibold text-ink">No pudimos cargar sus datos</p>
      <p className="mt-2 font-body text-sm text-ink-dim">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-md px-4 py-16 text-center font-body text-ink-dim">
      No encontramos esta información.
    </div>
  ),
  component: MiPanel,
});

function MiPanel() {
  const panel = Route.useLoaderData();
  const router = useRouter();
  const [formularioAbierto, setFormularioAbierto] = useState(panel.examenes.length === 0);

  /** Cierra la sesión y vuelve a la pantalla de acceso. */
  async function salir() {
    await supabase.auth.signOut();
    router.navigate({ to: "/auth" });
  }

  return (
    <>
      <Fondo />

      <div className="mx-auto min-h-screen max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <Encabezado
          paciente={panel.paciente}
          accion={
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFormularioAbierto((abierto) => !abierto)}
                className="rounded-[min(1vw,8px)] bg-accent-teal/15 px-4 py-2 font-display text-sm font-medium text-accent-teal ring-1 ring-accent-teal/20 transition-colors hover:bg-accent-teal/25"
              >
                {formularioAbierto ? "Ocultar formulario" : "Subir examen"}
              </button>
              <button
                onClick={salir}
                className="rounded-[min(1vw,8px)] bg-white/[0.06] px-3 py-2 font-display text-sm text-ink-dim ring-1 ring-white/10 transition-colors hover:text-ink"
              >
                Salir
              </button>
            </div>
          }
        />

        {formularioAbierto && (
          <SubirExamen
            onGuardado={() => router.invalidate()}
            onCerrar={() => setFormularioAbierto(false)}
          />
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          <PanelRiesgo evaluacion={panel.evaluacion} />

          <main>
            {panel.biomarcadores.length > 0 && (
              <Biomarcadores biomarcadores={panel.biomarcadores} />
            )}

            {panel.examenes.length > 0 ? (
              <LineaExamenes examenes={panel.examenes} />
            ) : (
              <p className="rounded-[min(1.5vw,14px)] bg-white/[0.04] p-5 font-body text-sm text-ink-dim ring-1 ring-white/10">
                Todavía no hay exámenes registrados. Use “Subir examen” para agregar los
                resultados de su laboratorio y verlos aquí en orden cronológico.
              </p>
            )}

            {panel.recomendaciones.length > 0 && (
              <Recomendaciones recomendaciones={panel.recomendaciones} />
            )}
          </main>
        </div>
      </div>
    </>
  );
}
