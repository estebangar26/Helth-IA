/**
 * FRONTEND · Bloque de recomendaciones nutricionales.
 * El texto lo produce el backend (a futuro, el componente de IA acotado a
 * nutrición); este componente solo lo presenta como lista legible.
 */
import { AvisoMedico } from "./AvisoMedico";

export function Recomendaciones({ recomendaciones }: { recomendaciones: string[] }) {
  return (
    <section className="rounded-lg bg-brand-blue p-5 text-primary-foreground shadow-md">
      <p className="font-body text-xs font-semibold uppercase text-primary-foreground/70">Próximos pasos</p>
      <h2 className="mt-1 mb-4 font-display text-lg font-bold">Recomendaciones nutricionales</h2>
      <ul className="space-y-2.5 font-body">
        {recomendaciones.map((texto) => (
          <li key={texto} className="flex gap-3 text-sm leading-relaxed text-primary-foreground/90">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-lime text-[11px] font-bold text-ink">✓</span>
            <span>{texto}</span>
          </li>
        ))}
      </ul>
      <div className="mt-5"><AvisoMedico inverso /></div>
    </section>
  );
}
