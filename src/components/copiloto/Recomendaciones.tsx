/**
 * FRONTEND · Bloque de recomendaciones nutricionales.
 * El texto lo produce el backend (a futuro, el componente de IA acotado a
 * nutrición); este componente solo lo presenta como lista legible.
 */

export function Recomendaciones({ recomendaciones }: { recomendaciones: string[] }) {
  return (
    <div className="mt-8 rounded-[min(1.5vw,16px)] bg-white/[0.04] p-5 ring-1 ring-white/10 backdrop-blur-xl">
      <p className="mb-3 font-display text-[11px] font-semibold tracking-[0.12em] uppercase text-ink-dim">
        Recomendaciones nutricionales
      </p>
      <ul className="space-y-2.5 font-body">
        {recomendaciones.map((texto) => (
          <li key={texto} className="flex gap-3 text-sm leading-relaxed text-ink/85">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent-teal" />
            <span>{texto}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
