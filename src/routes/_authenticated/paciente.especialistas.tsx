import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Search, Stethoscope } from "lucide-react";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { listarEspecialistas } from "@/lib/copiloto/especialistas.functions";

export const Route = createFileRoute("/_authenticated/paciente/especialistas")({
  loader: () => listarEspecialistas(),
  head: () => ({ meta: [
    { title: "Especialistas · HelthIA" },
    { name: "description", content: "Directorio de especialistas de salud en Colombia para pacientes de HelthIA." },
    { property: "og:title", content: "Especialistas · HelthIA" },
    { property: "og:description", content: "Listado filtrable por enfermedad y especialidad." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Especialistas,
});

function Especialistas() {
  const especialistas = Route.useLoaderData();
  const [enfermedad, setEnfermedad] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const filtrados = useMemo(() => especialistas.filter((item) => item.enfermedad.toLowerCase().includes(enfermedad.toLowerCase()) && item.especialidad.toLowerCase().includes(especialidad.toLowerCase())), [especialistas, enfermedad, especialidad]);

  return <main>
    <header className="rounded-lg border border-clinical-border bg-panel p-5 shadow-sm sm:p-6"><p className="font-body text-xs font-semibold uppercase text-brand-blue">Espacio del paciente</p><h1 className="mt-1 font-display text-2xl font-bold text-ink">Especialistas</h1><p className="mt-2 font-body text-sm text-ink-dim">Directorio ficticio de ejemplo con profesionales en Colombia.</p></header>
    <div className="mt-5 grid gap-3 rounded-lg border border-clinical-border bg-panel p-4 sm:grid-cols-2"><label className="font-body text-xs font-semibold text-ink-dim">Enfermedad<Input value={enfermedad} onChange={(e) => setEnfermedad(e.target.value)} placeholder="Ej. diabetes" className="mt-1.5 bg-panel" /></label><label className="font-body text-xs font-semibold text-ink-dim">Especialidad<Input value={especialidad} onChange={(e) => setEspecialidad(e.target.value)} placeholder="Ej. endocrinología" className="mt-1.5 bg-panel" /></label></div>
    <main className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filtrados.map((item) => <article key={item.id} className="rounded-lg border border-clinical-border bg-panel p-5 shadow-sm"><Stethoscope className="text-brand-blue" aria-hidden="true" /><h2 className="mt-3 font-display text-lg font-bold text-ink">{item.nombre}</h2><p className="mt-1 font-body text-sm font-semibold text-brand-blue">{item.especialidad}</p><p className="mt-3 font-body text-sm text-ink-dim">{item.enfermedad}</p><p className="mt-2 flex items-center gap-2 font-body text-xs text-ink-dim"><MapPin className="size-4" aria-hidden="true" />{item.ciudad}</p><p className="mt-3 break-all font-body text-xs text-ink">{item.contacto}</p></article>)}{filtrados.length === 0 && <p className="col-span-full rounded-lg border border-dashed border-clinical-border bg-panel p-8 text-center font-body text-sm text-ink-dim"><Search className="mx-auto mb-2" aria-hidden="true" />No hay coincidencias con esos filtros.</p>}</main>
  </main>;
}
