/**
 * FRONTEND · Panel del paciente con sus exámenes reales (ruta "/panel")
 * ---------------------------------------------------------------------
 * Solo se ve con sesión activa. Pide los datos al backend y permite registrar
 * un examen nuevo; al guardarlo, la línea de tiempo se actualiza sola.
 */

import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { LogOut, Stethoscope, Upload } from "lucide-react";
import { useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { obtenerMiPanel } from "@/lib/copiloto/examenes.functions";
import { Biomarcadores } from "@/components/copiloto/Biomarcadores";
import { CompartirConDoctora } from "@/components/copiloto/CompartirConDoctora";
import { Encabezado } from "@/components/copiloto/Encabezado";
import { Fondo } from "@/components/copiloto/Fondo";
import { LineaExamenes } from "@/components/copiloto/LineaExamenes";
import { PanelRiesgo } from "@/components/copiloto/PanelRiesgo";
import { Recomendaciones } from "@/components/copiloto/Recomendaciones";
import { SubirExamen } from "@/components/copiloto/SubirExamen";
import { Button } from "@/components/ui/button";

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

      <div className="mx-auto min-h-screen max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Encabezado
          paciente={panel.paciente}
          accion={
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setFormularioAbierto((abierto) => !abierto)}
              >
                <Upload aria-hidden="true" />
                {formularioAbierto ? "Ocultar formulario" : "Subir examen"}
              </Button>
              <Button
                onClick={salir}
                variant="outline"
                size="icon"
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
              >
                <LogOut aria-hidden="true" />
              </Button>
            </div>
          }
        />

        {formularioAbierto && (
          <SubirExamen
            onGuardado={() => router.invalidate()}
            onCerrar={() => setFormularioAbierto(false)}
          />
        )}

        <main className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {panel.biomarcadores.length > 0 && (
              <Biomarcadores biomarcadores={panel.biomarcadores} />
            )}

            {panel.examenes.length > 0 ? (
              <LineaExamenes examenes={panel.examenes} />
            ) : (
              <p className="rounded-lg border border-dashed border-clinical-border bg-panel p-6 font-body text-sm text-ink-dim">
                Todavía no hay exámenes registrados. Use “Subir examen” para agregar los
                resultados de su laboratorio y verlos aquí en orden cronológico.
              </p>
            )}

          </div>
          <div className="space-y-6">
            <PanelRiesgo evaluacion={panel.evaluacion} />
            <CompartirConDoctora />
            {panel.recomendaciones.length > 0 && <Recomendaciones recomendaciones={panel.recomendaciones} />}
            <div className="rounded-lg border border-clinical-border bg-panel p-4">
              <p className="font-body text-[10px] font-semibold uppercase text-ink-dim">Interoperabilidad</p>
              <p className="mt-1 font-body text-sm font-semibold text-ink">Datos clínicos estructurados</p>
              <p className="mt-1 font-body text-xs leading-relaxed text-ink-dim">Preparado para mapear resultados a recursos HL7 FHIR tras una integración validada.</p>
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link to="/medico"><Stethoscope aria-hidden="true" /> Vista para doctora</Link>
            </Button>
          </div>
        </main>
      </div>
    </>
  );
}
