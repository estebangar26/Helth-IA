/** FRONTEND · Página pública «Sobre nosotros»: quién crea HelthIA y con qué criterio. */
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BrainCircuit,
  ClipboardCheck,
  Cpu,
  GraduationCap,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

import fotoEsteban from "@/assets/foto-esteban.jpg.asset.json";
import { NavegacionPublica } from "@/components/copiloto/NavegacionPublica";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/sobre-nosotros")({
  head: () => ({
    meta: [
      { title: "Sobre nosotros · HelthIA" },
      {
        name: "description",
        content: "HelthIA es un proyecto de Esteban García Otálvaro, estudiante de Bioingeniería y del Bootcamp de Desarrollo de Software de Jóvenes Creativos de Sofka.",
      },
      { property: "og:title", content: "Sobre nosotros · HelthIA" },
      {
        property: "og:description",
        content: "Bioingeniería, sistemas embebidos y datos aplicados a la salud: el origen de HelthIA.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SobreNosotros,
});

const formacion = [
  {
    icono: GraduationCap,
    titulo: "Bioingeniería · Octavo semestre",
    texto: "Universidad de Antioquia. Formación en ingeniería biomédica y clínica, con foco en análisis de datos, sistemas embebidos y desarrollo tecnológico para salud.",
  },
  {
    icono: Cpu,
    titulo: "Bootcamp de Desarrollo de Software",
    texto: "Programa Jóvenes Creativos de Sofka. Práctica de construcción de software aplicada a productos reales de salud.",
  },
];

const proyectos = [
  {
    icono: Cpu,
    titulo: "Monitor biomédico con ESP32-S3",
    texto: "Integra pulsioximetría, temperatura y un panel web en tiempo real. Es un prototipo de bajo costo que funciona en su propia red Wi-Fi local.",
    enlace: { destino: "/dispositivos" as const, texto: "Ver el monitor" },
  },
  {
    icono: ClipboardCheck,
    titulo: "Suficiencia de equipos biomédicos",
    texto: "Entregables preparados para el servicio de cardiología de un hospital: análisis de Pareto e Ishikawa, indicadores de gestión y un tablero de alertas predictivas.",
  },
  {
    icono: BrainCircuit,
    titulo: "HelthIA",
    texto: "Aplicación web con IA para el seguimiento de la salud a partir de exámenes médicos, con recomendaciones nutricionales basadas en productos colombianos.",
    enlace: { destino: "/servicios" as const, texto: "Ver los servicios" },
  },
];

function SobreNosotros() {
  return (
    <div className="min-h-screen bg-surface text-ink">
      <NavegacionPublica />
      <main>
        <section className="border-b border-clinical-border bg-panel">
          <div className="mx-auto grid max-w-[1200px] items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8 lg:py-16">
            <div>
              <p className="font-body text-xs font-bold uppercase text-primary">Sobre nosotros</p>
              <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">Esteban García Otálvaro</h1>
              <p className="mt-5 max-w-2xl font-body text-base leading-7 text-ink-dim">
                Soy estudiante de octavo semestre de Bioingeniería en la Universidad de Antioquia y del Bootcamp de
                Desarrollo de Software de Jóvenes Creativos de Sofka. Trabajo en ingeniería biomédica y clínica, con
                foco en análisis de datos, sistemas embebidos y desarrollo tecnológico para salud.
              </p>
              <p className="mt-4 max-w-2xl font-body text-base leading-7 text-ink-dim">
                HelthIA reúne esas dos partes: el conocimiento del entorno clínico y la capacidad de construir el
                software que lo acompaña.
              </p>
            </div>
            <div className="mx-auto w-full max-w-[300px]">
              <img
                src={fotoEsteban.url}
                alt="Retrato de Esteban García Otálvaro"
                width={1440}
                height={1920}
                className="aspect-[4/5] w-full rounded-lg border border-clinical-border object-cover object-bottom"
              />
            </div>
          </div>
        </section>

        <section className="py-14 sm:py-16" aria-labelledby="formacion-titulo">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
            <h2 id="formacion-titulo" className="font-display text-3xl font-bold text-ink">Formación</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {formacion.map(({ icono: Icono, titulo, texto }) => (
                <article key={titulo} className="rounded-lg border border-clinical-border bg-panel p-6">
                  <span className="grid size-11 place-items-center rounded-md bg-secondary text-primary"><Icono aria-hidden="true" /></span>
                  <h3 className="mt-5 font-display text-lg font-bold text-ink">{titulo}</h3>
                  <p className="mt-3 font-body text-sm leading-6 text-ink-dim">{texto}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-clinical-border bg-panel-soft py-14 sm:py-16" aria-labelledby="proyectos-titulo">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
            <h2 id="proyectos-titulo" className="font-display text-3xl font-bold text-ink">Proyectos y experiencia</h2>
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {proyectos.map(({ icono: Icono, titulo, texto, enlace }) => (
                <article key={titulo} className="flex h-full flex-col rounded-lg border border-clinical-border bg-panel p-6">
                  <span className="grid size-11 place-items-center rounded-md bg-secondary text-primary"><Icono aria-hidden="true" /></span>
                  <h3 className="mt-5 font-display text-lg font-bold text-ink">{titulo}</h3>
                  <p className="mt-3 font-body text-sm leading-6 text-ink-dim">{texto}</p>
                  {enlace && (
                    <Link to={enlace.destino} className="mt-auto inline-flex items-center gap-1 pt-5 font-body text-sm font-semibold text-primary hover:underline">
                      {enlace.texto} <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14 sm:py-16" aria-labelledby="marco-titulo">
          <div className="mx-auto grid max-w-[1200px] gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div>
              <div className="flex items-center gap-3 text-primary"><ShieldCheck aria-hidden="true" /><span className="font-body text-xs font-bold uppercase">Marco regulatorio</span></div>
              <h2 id="marco-titulo" className="mt-4 font-display text-2xl font-bold text-ink">Conozco las reglas del sector en Colombia</h2>
              <p className="mt-4 font-body leading-7 text-ink-dim">
                Manejo el marco regulatorio colombiano del sector salud, incluidos INVIMA y la Resolución 3100 de 2019,
                y sigo de cerca la inteligencia artificial aplicada a la medicina.
              </p>
            </div>
            <div className="border-l-2 border-brand-lime bg-panel p-6">
              <p className="font-body text-sm font-bold text-ink">Cómo se refleja en HelthIA</p>
              <p className="mt-3 font-body text-sm leading-6 text-ink-dim">
                La plataforma entrega información orientativa y trazable: cada resultado muestra de dónde viene, no
                sustituye la valoración de un profesional de la salud y no se presenta como un producto certificado ni
                como un sistema interoperable ya validado.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-trust-surface py-14 text-primary-foreground">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-7 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3"><Stethoscope className="text-brand-lime" aria-hidden="true" /><span className="font-body text-xs font-bold uppercase">Busco oportunidades de práctica</span></div>
              <h2 className="mt-3 font-display text-3xl font-bold">Unir ingeniería clínica, datos y tecnología.</h2>
            </div>
            <Button asChild size="lg" className="bg-brand-lime text-accent-foreground hover:bg-brand-lime/90">
              <Link to="/paciente">Probar HelthIA <ArrowRight aria-hidden="true" /></Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
