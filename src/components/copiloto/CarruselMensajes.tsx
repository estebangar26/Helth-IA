import { ChevronLeft, ChevronRight, FlaskConical, Pill } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

const mensajes = [
  { titulo: "Avances en monitoreo", texto: "La investigación continúa mejorando el seguimiento temprano de biomarcadores.", icono: FlaskConical },
  { titulo: "Medicamentos a tiempo", texto: "Mantenga los horarios indicados por su profesional para favorecer la continuidad del tratamiento.", icono: Pill },
  { titulo: "Adherencia al tratamiento", texto: "Seguir el plan acordado ayuda a obtener resultados comparables y tomar mejores decisiones.", icono: Pill },
  { titulo: "Ciencia y prevención", texto: "Los controles periódicos permiten conversar con su equipo de salud sobre cambios relevantes.", icono: FlaskConical },
];

export function CarruselMensajes() {
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    const intervalo = window.setInterval(() => setIndice((actual) => (actual + 1) % mensajes.length), 7000);
    return () => window.clearInterval(intervalo);
  }, []);

  const mensaje = mensajes[indice] ?? mensajes[0];
  if (!mensaje) return null;
  const Icono = mensaje.icono;

  return (
    <section className="mb-6 flex min-h-28 items-center gap-4 rounded-lg border border-clinical-border bg-panel p-4 shadow-sm sm:p-5" aria-label="Mensajes de salud">
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-lime/15 text-brand-lime"><Icono aria-hidden="true" /></span>
      <div className="min-w-0 flex-1">
        <p className="font-body text-xs font-semibold uppercase text-brand-blue">Para tener en cuenta</p>
        <h2 className="mt-1 font-display text-base font-bold text-ink">{mensaje.titulo}</h2>
        <p className="mt-1 font-body text-sm leading-relaxed text-ink-dim">{mensaje.texto}</p>
      </div>
      <div className="flex shrink-0 gap-1">
        <Button type="button" size="icon" variant="ghost" aria-label="Mensaje anterior" onClick={() => setIndice((indice - 1 + mensajes.length) % mensajes.length)}><ChevronLeft aria-hidden="true" /></Button>
        <Button type="button" size="icon" variant="ghost" aria-label="Mensaje siguiente" onClick={() => setIndice((indice + 1) % mensajes.length)}><ChevronRight aria-hidden="true" /></Button>
      </div>
    </section>
  );
}
