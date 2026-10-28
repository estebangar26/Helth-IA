import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PanelAlimentacion, etiquetas } from '@/components/alimentacion/PanelAlimentacion';
import { AVISO, type Lectura } from '@/lib/alimentacion/tipos';
import type { Biomarcador, Examen, ResultadoCatalogo } from '@/lib/copiloto/tipos';
import { lecturasAlimentacion, muestraApoyo } from '@/lib/alimentacion/lecturas';
/** Recibe lecturas del catálogo existente; no clasifica resultados. */
export function AlimentacionResultados({ resultados, biomarcadores = [], examenes = [] }: { resultados: ResultadoCatalogo[]; biomarcadores?: Biomarcador[]; examenes?: Examen[] }) {
 const [detalle,setDetalle]=useState<Lectura|null>(null);
 const lecturas=useMemo(()=>lecturasAlimentacion(resultados,biomarcadores,examenes),[resultados,biomarcadores,examenes]);
 const alteradas=lecturas.filter(muestraApoyo);
 return <section className="min-w-0 space-y-5 break-words"><h1 className="font-display text-xl font-bold">Alimentación recomendada</h1><p className="border-l-4 border-brand-lime pl-3 text-sm text-ink">{AVISO}</p>{alteradas.length===0?<p className="text-sm text-ink-dim">No hay resultados con alteración identificada para mostrar alimentación de apoyo.</p>:<div className="grid min-w-0 grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))] gap-4">{alteradas.map(r=><article key={r.codigo} className="min-w-0 rounded-md border border-clinical-border bg-panel p-4"><h2 className="font-display font-bold">{r.nombre}</h2><p className="mt-2 font-semibold">{r.valor} {r.unidad}</p><p className="mt-1 text-xs text-ink-dim">{etiquetas[r.estado]} · {r.fecha}</p>{r.categoria==='hormonal' && <p className="mt-2 text-sm text-ink-dim">No hay alimentos que corrijan de forma confiable este valor; consulta con endocrinología o ginecología. Hábitos que ayudan en general: dormir bien, hacer ejercicio y una alimentación variada.</p>}{r.categoria==='tumoral' && <p className="mt-2 text-sm text-ink-dim">Ningún alimento baja o previene la elevación de estos marcadores; consulta con tu médico.</p>}<Button className="mt-3 h-auto max-w-full whitespace-normal" variant="outline" onClick={()=>setDetalle(r)}>Ver alimentación de apoyo</Button></article>)}</div>}<PanelAlimentacion resultado={detalle} todos={lecturas} cerrar={()=>setDetalle(null)}/></section>;
}
