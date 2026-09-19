/** FRONTEND · Página pública de servicios del Copiloto de Salud. */
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BrainCircuit,
  Database,
  FileImage,
  HeartPulse,
  LockKeyhole,
  Share2,
} from "lucide-react";

import laboratorioFuturista from "@/assets/laboratorio-futurista.jpg";
import { NavegacionPublica } from "@/components/copiloto/NavegacionPublica";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/servicios")({
  head: () => ({
    meta: [
      { title: "Servicios · Copiloto de Salud" },
      {
        name: "description",
        content: "Conozca la lectura asistida de exámenes, el seguimiento clínico, el riesgo explicable y el acceso médico controlado.",
      },
      { property: "og:title", content: "Servicios de Copiloto de Salud" },
      {
        property: "og:description",
        content: "Exámenes organizados, seguimiento longitudinal y colaboración segura con profesionales de salud.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Servicios,
});

const detalles = [
  { icono: FileImage, titulo: "Carga inteligente de exámenes", texto: "Suba un PDF, JPG, PNG o WEBP. El sistema identifica valores visibles como glucemia, HbA1c, creatinina y presión arterial para organizarlos en su cuenta." },
  { icono: HeartPulse, titulo: "Línea de tiempo clínica", texto: "Cada examen se ordena por fecha para ofrecer una lectura longitudinal y mostrar cambios entre mediciones." },
  { icono: BrainCircuit, titulo: "Clasificación de riesgo explicable", texto: "Las reglas muestran qué biomarcadores influyen en el nivel observado. El resultado sirve como apoyo informativo y no como diagnóstico." },
  { icono: Share2, titulo: "Colaboración con su doctora", texto: "Invite por correo a una profesional para consultar sus resultados y riesgo en modo de solo lectura. Usted puede retirar el acceso." },
];

function Servicios() {
  return (
    <div className="min-h-screen bg-surface text-ink">
      <NavegacionPublica />
      <main>
        <section className="border-b border-clinical-border bg-panel">
          <div className="mx-auto grid max-w-[1200px] lg:grid-cols-2">
            <div className="flex flex-col justify-center px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
              <p className="font-body text-xs font-bold uppercase text-primary">Servicios</p>
              <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">Tecnología que convierte resultados en seguimiento.</h1>
              <p className="mt-6 max-w-xl font-body text-base leading-7 text-ink-dim">Desde la lectura del documento hasta la conversación con su doctora, cada servicio está diseñado para ofrecer claridad, continuidad y control.</p>
              <div className="mt-8"><Button asChild size="lg"><Link to="/panel">Abrir mi panel <ArrowRight aria-hidden="true" /></Link></Button></div>
            </div>
            <div className="relative min-h-[340px] overflow-hidden lg:min-h-[520px]">
              <img src={laboratorioFuturista} alt="Laboratorio futurista con visualizaciones clínicas digitales" width={1600} height={1000} className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-hero-overlay p-5 text-primary-foreground">
                <p className="font-body text-xs font-bold uppercase">Entorno clínico conectado</p>
                <p className="mt-1 font-body text-sm text-primary-foreground/80">Información legible para pacientes y profesionales.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="font-body text-xs font-bold uppercase text-primary">Qué puede hacer</p>
              <h2 className="mt-3 font-display text-3xl font-bold text-ink">Un flujo continuo, desde el archivo hasta la consulta</h2>
            </div>
            <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-clinical-border bg-clinical-border md:grid-cols-2">
              {detalles.map(({ icono: Icono, titulo, texto }) => (
                <article key={titulo} className="bg-panel p-6 sm:p-8">
                  <span className="grid size-11 place-items-center rounded-md bg-secondary text-primary"><Icono aria-hidden="true" /></span>
                  <h3 className="mt-6 font-display text-xl font-bold text-ink">{titulo}</h3>
                  <p className="mt-3 font-body text-sm leading-6 text-ink-dim">{texto}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-clinical-border bg-panel-soft py-16">
          <div className="mx-auto grid max-w-[1200px] gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div>
              <div className="flex items-center gap-3 text-primary"><Database aria-hidden="true" /><span className="font-body text-xs font-bold uppercase">Interoperabilidad</span></div>
              <h2 className="mt-4 font-display text-3xl font-bold text-ink">Preparado para información clínica estructurada</h2>
              <p className="mt-4 font-body leading-7 text-ink-dim">El modelo de información separa perfiles, exámenes y observaciones para facilitar su transformación futura hacia recursos HL7 FHIR, como Patient, Observation y DiagnosticReport.</p>
            </div>
            <div className="border-l-2 border-brand-lime pl-6">
              <p className="font-body text-sm font-bold text-ink">Alcance responsable</p>
              <p className="mt-3 font-body text-sm leading-6 text-ink-dim">La interfaz aplica principios de trazabilidad, claridad de estados, privacidad y lectura clínica. La conformidad HL7 FHIR requiere perfiles, terminologías, validadores, pruebas de intercambio y revisión regulatoria específicas para cada integración.</p>
            </div>
          </div>
        </section>

        <section className="bg-trust-surface py-14 text-primary-foreground">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-7 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3"><LockKeyhole className="text-brand-lime" aria-hidden="true" /><span className="font-body text-xs font-bold uppercase">Su información, bajo su control</span></div>
              <h2 className="mt-3 font-display text-3xl font-bold">Empiece con su próximo resultado.</h2>
            </div>
            <Button asChild size="lg" className="bg-brand-lime text-accent-foreground hover:bg-brand-lime/90"><Link to="/panel">Ingresar de forma segura <ArrowRight aria-hidden="true" /></Link></Button>
          </div>
        </section>
      </main>
    </div>
  );
}