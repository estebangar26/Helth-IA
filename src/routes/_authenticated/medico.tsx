/** FRONTEND · Lista privada de pacientes compartidos con la doctora. */

import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ClipboardList, Stethoscope } from "lucide-react";

import { Fondo } from "@/components/copiloto/Fondo";
import { obtenerPacientesCompartidos } from "@/lib/copiloto/accesos.functions";

export const Route = createFileRoute("/_authenticated/medico")({
  loader: () => obtenerPacientesCompartidos(),
  head: () => ({
    meta: [
      { title: "Pacientes compartidos · HelthIA" },
      { name: "description", content: "Vista médica de pacientes que compartieron sus exámenes y clasificación de riesgo." },
      { property: "og:title", content: "Pacientes compartidos · HelthIA" },
      { property: "og:description", content: "Consulta clínica privada de exámenes compartidos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  errorComponent: ({ error }) => <div role="alert" className="mx-auto max-w-md px-4 py-16 text-center font-body text-ink">{(error as Error).message}</div>,
  component: PantallaMedica,
});

function PantallaMedica() {
  const pacientes = Route.useLoaderData();
  return (
    <>
      <Fondo />
      <div className="mx-auto min-h-screen max-w-[1100px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="mb-6 flex flex-col gap-4 rounded-lg border border-clinical-border bg-panel p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-center gap-3">
            <div className="grid size-12 shrink-0 place-items-center rounded-full bg-brand-blue/10 text-brand-blue"><Stethoscope aria-hidden="true" /></div>
            <div>
              <p className="font-body text-xs font-semibold uppercase text-brand-blue">Vista profesional</p>
              <h1 className="mt-1 font-display text-2xl font-bold text-ink">Pacientes compartidos</h1>
            </div>
          </div>
          <span className="font-body text-sm font-semibold text-brand-blue">HelthIA</span>
        </header>
        <main>
          {pacientes.length === 0 ? (
            <div className="rounded-lg border border-dashed border-clinical-border bg-panel p-8 text-center">
              <ClipboardList className="mx-auto size-9 text-brand-blue" aria-hidden="true" />
              <h2 className="mt-3 font-display text-lg font-bold text-ink">Aún no hay pacientes compartidos</h2>
              <p className="mx-auto mt-2 max-w-md font-body text-sm leading-relaxed text-ink-dim">Cuando un paciente la invite y usted ingrese con el correo invitado, aparecerá aquí.</p>
            </div>
          ) : (
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Pacientes">
              {pacientes.map((paciente) => (
                <article key={paciente.id} className="rounded-lg border border-clinical-border bg-panel p-5 shadow-sm">
                  <div className="grid size-11 place-items-center rounded-full bg-brand-lime/15 font-body font-bold text-brand-lime">{paciente.nombre.slice(0, 1).toUpperCase()}</div>
                  <h2 className="mt-4 font-display text-lg font-bold text-ink">{paciente.nombre}</h2>
                  <p className="mt-1 font-body text-sm text-ink-dim">{paciente.edad != null ? `${paciente.edad} años` : "Edad no registrada"}</p>
                  <Link to="/medico/$pacienteId" params={{ pacienteId: paciente.id }} className="mt-5 inline-flex items-center gap-2 font-body text-sm font-semibold text-brand-blue hover:underline">
                    Ver exámenes <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </article>
              ))}
            </section>
          )}
        </main>
      </div>
    </>
  );
}