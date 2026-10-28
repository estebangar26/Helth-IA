import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PanelAlimentacion } from '@/components/alimentacion/PanelAlimentacion';
import { AVISO, type Lectura } from '@/lib/alimentacion/tipos';
import type { ResultadoCatalogo } from '@/lib/copiloto/tipos';
/** Recibe lecturas del catálogo existente; no clasifica resultados. */
export function AlimentacionResultados({ resultados }: { resultados: ResultadoCatalogo[] }) {
 const [lecturas,setLecturas]=useState<Lectura[]>([]); const [detalle,setDetalle]=useState<Lectura|null>(null);
 useEffect(()=>{let activa=true;import('./ResultadosCatalogo').then(({estadoDesdeReferencia})=>{if(activa)setLecturas(resultados.map(r=>({...r,estado:estadoDesdeReferencia(r.valor,r.referencia,r.nombre)})));});return()=>{activa=false;};},[resultados]);
 const alteradas=lecturas.filter(r=>['debajo','encima'].includes(r.estado));
 return <section className="space-y-5"><h1 className="font-display text-xl font-bold">Alimentación recomendada</h1><p className="border-l-4 border-brand-lime pl-3 text-sm text-ink">{AVISO}</p>{alteradas.length===0?<p className="text-sm text-ink-dim">No hay resultados con alteración identificada para mostrar alimentación de apoyo.</p>:<div className="grid gap-4 sm:grid-cols-2">{alteradas.map(r=><article key={r.codigo} className="min-w-0 rounded-md border border-clinical-border bg-panel p-4"><h2 className="font-display font-bold">{r.nombre}</h2><p className="mt-2 font-semibold">{r.valor} {r.unidad}</p><p className="mt-1 text-xs text-ink-dim">{r.estado==='debajo'?'Por debajo del rango reportado':'Por encima del rango reportado'} · {r.fecha}</p><Button className="mt-3 h-auto whitespace-normal" variant="outline" onClick={()=>setDetalle(r)}>Ver alimentación de apoyo</Button></article>)}</div>}<PanelAlimentacion resultado={detalle} todos={lecturas} cerrar={()=>setDetalle(null)}/></section>;
}
