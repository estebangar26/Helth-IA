/**
 * FRONTEND · Portada pública.
 * Los datos reales del paciente permanecen en la ruta protegida "/panel".
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  FileSearch,
  HeartPulse,
  LockKeyhole,
  Stethoscope,
} from "lucide-react";

import fondoSaludFuturista from "@/assets/fondo-salud-futurista.jpg";
import { NavegacionPublica } from "@/components/copiloto/NavegacionPublica";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Copiloto de Salud · Exámenes y riesgo en un solo lugar" },
      {
        name: "description",
        content:
          "Organice sus exámenes, comprenda sus indicadores de riesgo y comparta una vista clínica de solo lectura con su profesional de salud.",
      },
      { property: "og:title", content: "Copiloto de Salud · Información clínica conectada" },
      {
        property: "og:description",
        content: "Una experiencia clara para reunir exámenes, seguir cambios y compartir información clínica.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Inicio,
});

const servicios = [
  {
    icono: FileSearch,
    titulo: "Lectura de resultados",
    texto: "Adjunte su PDF o fotografía. El sistema identifica los valores clínicos visibles sin pedirle transcribirlos.",
  },
  {
    icono: HeartPulse,
    titulo: "Seguimiento longitudinal",
    texto: "Consulte biomarcadores y exámenes por fecha para reconocer cambios importantes a lo largo del tiempo.",
  },
  {
    icono: BrainCircuit,
    titulo: "Riesgo explicable",
    texto: "Reciba una clasificación acompañada de las variables que influyen en ella, sin reemplazar el criterio médico.",
  },
];

function Inicio() {
  return (
    <div className="min-h-screen bg-surface text-ink">
      <NavegacionPublica />

      <main>
        <section className="relative isolate min-h-[660px] overflow-hidden border-b border-clinical-border lg:min-h-[720px]">
          <img
            src={fondoSaludFuturista}
            alt="Visualización futurista de información médica, ADN y señales clínicas"
            width={1920}
            height={1080}
            className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 -z-10 bg-hero-overlay" />

          <div className="mx-auto flex min-h-[660px] max-w-[1200px] items-end px-4 py-14 sm:px-6 lg:min-h-[720px] lg:px-8 lg:py-20">
            <div className="max-w-3xl text-primary-foreground">
              <div className="mb-6 inline-flex items-center gap-2 rounded-md border border-primary-foreground/30 bg-primary-foreground/10 px-3 py-2 font-body text-xs font-semibold uppercase backdrop-blur-md">
                <span className="size-2 rounded-full bg-brand-lime" />
                Salud digital clara y conectada
              </div>
              <h1 className="max-w-3xl font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                Sus exámenes cuentan una historia. Véalos juntos.
              </h1>
              <p className="mt-6 max-w-2xl font-body text-base leading-7 text-primary-foreground/85 sm:text-lg">
                Reúna resultados de laboratorio, siga sus biomarcadores y comparta una vista organizada con su doctora desde un entorno privado.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="bg-brand-lime text-accent-foreground hover:bg-brand-lime/90">
                  <Link to="/panel">Ir a mi panel <ArrowRight aria-hidden="true" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-primary-foreground/40 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground">
                  <Link to="/servicios">Conocer los servicios</Link>
                </Button>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 font-body text-sm text-primary-foreground/80">
                <span className="flex items-center gap-2"><CheckCircle2 className="size-4 text-brand-lime" /> PDF y fotografías</span>
                <span className="flex items-center gap-2"><CheckCircle2 className="size-4 text-brand-lime" /> Acceso médico revocable</span>
                <span className="flex items-center gap-2"><CheckCircle2 className="size-4 text-brand-lime" /> Datos estructurados</span>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface py-16 sm:py-20">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <div>
                <p className="font-body text-xs font-bold uppercase text-primary">Un recorrido sencillo</p>
                <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">Información útil para conversar mejor sobre su salud</h2>
              </div>
              <p className="max-w-2xl font-body text-base leading-7 text-ink-dim lg:justify-self-end">
                El Copiloto transforma documentos dispersos en una vista ordenada. Cada resultado conserva su fecha y contexto para facilitar el seguimiento.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {servicios.map(({ icono: Icono, titulo, texto }, indice) => (
                <article key={titulo} className="border-t-2 border-primary bg-panel p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="grid size-11 place-items-center rounded-md bg-secondary text-primary"><Icono aria-hidden="true" /></span>
                    <span className="font-body text-xs font-bold text-ink-dim">0{indice + 1}</span>
                  </div>
                  <h3 className="mt-7 font-display text-xl font-bold text-ink">{titulo}</h3>
                  <p className="mt-3 font-body text-sm leading-6 text-ink-dim">{texto}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-trust-surface py-14 text-primary-foreground">
          <div className="mx-auto grid max-w-[1200px] gap-8 px-4 sm:px-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-center lg:px-8">
            <div>
              <div className="flex items-center gap-3"><LockKeyhole className="size-6 text-brand-lime" /><span className="font-body text-xs font-bold uppercase">Privacidad y control</span></div>
              <h2 className="mt-4 font-display text-3xl font-bold">Usted decide quién puede consultar sus resultados.</h2>
              <p className="mt-4 max-w-2xl font-body leading-7 text-primary-foreground/80">La vista para profesionales es de solo lectura y puede revocarse. El diseño organiza observaciones clínicas para facilitar futuras integraciones basadas en HL7 FHIR, sujetas a validación técnica.</p>
            </div>
            <div className="flex flex-col gap-3 lg:items-end">
              <Button asChild size="lg" className="bg-brand-lime text-accent-foreground hover:bg-brand-lime/90">
                <Link to="/panel"><Stethoscope aria-hidden="true" /> Comenzar ahora</Link>
              </Button>
              <p className="font-body text-xs text-primary-foreground/65">No sustituye el diagnóstico ni la atención profesional.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-clinical-border bg-panel py-6">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 px-4 font-body text-xs text-ink-dim sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span>Copiloto de Salud · Apoyo para el seguimiento clínico</span>
          <span>Privacidad · Datos estructurados · Acceso controlado</span>
        </div>
      </footer>
    </div>
  );
}