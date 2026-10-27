import comida from '@/assets/alimentacion-colombiana.jpg';
import vida from '@/assets/vida-saludable-colombia.jpg';
import { AvisoMedico } from './AvisoMedico';
import { orientarResultado } from '@/lib/copiloto/orientacion-alimentaria';
import type { ResultadoCatalogo } from '@/lib/copiloto/tipos';

const estados = { dentro: 'Dentro del rango reportado', debajo: 'Por debajo del rango reportado', encima: 'Por encima del rango reportado', sin_rango: 'Sin rango interpretable' };
export function AlimentacionResultados({ resultados }: { resultados: ResultadoCatalogo[] }) {
  return <section className="space-y-5">
    <div><p className="font-body text-xs font-semibold uppercase text-brand-blue">Alimentación y bienestar</p><h1 className="mt-1 font-display text-xl font-bold text-ink">Sus resultados, su alimentación</h1><p className="mt-2 font-body text-sm leading-relaxed text-ink-dim">Opciones colombianas como apoyo, no como tratamiento. Un valor aislado no indica qué debe tomar ni confirma una deficiencia.</p></div>
    <div className="grid gap-5 sm:grid-cols-2">
      <figure><img src={comida} width={1200} height={800} loading="lazy" alt="Plato variado con pescado, lentejas, arroz, ensalada y aguacate" className="aspect-[3/2] w-full rounded-md object-cover" /><figcaption className="mt-2 font-body text-sm text-ink">Fríjoles y lentejas, verduras y preparaciones caseras; porciones según su valoración nutricional.</figcaption></figure>
      <figure><img src={vida} width={1200} height={800} loading="lazy" alt="Personas caminando en un parque colombiano" className="aspect-[3/2] w-full rounded-md object-cover" /><figcaption className="mt-2 font-body text-sm text-ink">Movimiento según su capacidad y plan médico, descanso regular y evitar tabaco.</figcaption></figure>
    </div>
    {resultados.length === 0 ? <p className="font-body text-sm text-ink-dim">Sin resultados registrados para personalizar la orientación alimentaria.</p> : <div className="grid gap-4 sm:grid-cols-2">{resultados.map(r => { const guia = orientarResultado(r); return <article key={r.codigo} className="rounded-md border border-clinical-border bg-panel p-5">
      <h2 className="font-display text-base font-bold text-ink">{r.nombre}</h2><p className="mt-1 font-body text-lg font-semibold text-brand-blue">{r.valor} {r.unidad}</p><p className="font-body text-xs text-ink-dim">{r.fecha} · {estados[guia.estado]}</p><p className="mt-1 font-body text-xs text-ink-dim">Referencia del laboratorio: {r.referencia ?? 'No disponible'}</p><p className="mt-3 font-body text-sm leading-relaxed text-ink">{guia.texto}</p>
    </article>; })}</div>}
    <AvisoMedico />
  </section>;
}