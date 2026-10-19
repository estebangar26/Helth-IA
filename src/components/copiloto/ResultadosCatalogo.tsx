/**
 * FRONTEND · Explorador del catálogo de resultados (exclusivo de la pestaña
 * Resultados y exámenes). Agrupa por categoría clínica, con buscador, filtros,
 * secciones expandibles y un panel de detalle con historial real.
 * Nunca inventa resultados: solo muestra variables con valores guardados.
 */

import { useMemo, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";

import type { ResultadoCatalogo } from "@/lib/copiloto/tipos";
import { ETIQUETA_CATEGORIA, ORDEN_CATEGORIAS } from "@/lib/copiloto/catalogo-resultados";
import { Input } from "@/components/ui/input";

/** Estado analítico derivado SOLO del rango que reportó el laboratorio. */
type EstadoResultado = "dentro" | "debajo" | "encima" | "sin_rango";

const ETIQUETA_ESTADO: Record<EstadoResultado, string> = {
  dentro: "Dentro del rango reportado",
  debajo: "Por debajo del rango reportado",
  encima: "Por encima del rango reportado",
  sin_rango: "Sin rango de referencia",
};

const CHIP_ESTADO: Record<EstadoResultado, string> = {
  dentro: "text-ok bg-ok/10 ring-ok/20",
  debajo: "text-warn bg-warn/10 ring-warn/20",
  encima: "text-warn bg-warn/10 ring-warn/20",
  sin_rango: "text-ink-dim bg-panel ring-clinical-border",
};

/**
 * Intenta leer "min-max" del texto de referencia del laboratorio.
 * Si no puede interpretarse con seguridad, devuelve null (sin rango).
 */
function estadoDesdeReferencia(valor: number, referencia: string | null): EstadoResultado {
  if (!referencia) return "sin_rango";
  const numeros = referencia.match(/-?\d+(?:[.,]\d+)?/g)?.map((n) => Number(n.replace(",", ".")));
  if (!numeros || numeros.length === 0) return "sin_rango";
  if (numeros.length >= 2) {
    const [min, max] = numeros;
    if (valor < min) return "debajo";
    if (valor > max) return "encima";
    return "dentro";
  }
  // Un solo número: se interpreta como límite superior solo si el texto lo sugiere.
  if (/[<≤]|hasta|máx/i.test(referencia)) return valor > numeros[0] ? "encima" : "dentro";
  return "sin_rango";
}

/** Variación porcentual frente al resultado anterior, si existe. */
function variacion(r: ResultadoCatalogo): string | null {
  if (r.historial.length < 2) return null;
  const anterior = r.historial[r.historial.length - 2].valor;
  if (anterior === 0) return null;
  const delta = r.valor - anterior;
  const pct = Math.abs((delta / anterior) * 100).toFixed(1);
  return delta === 0 ? "Sin cambio frente al anterior" : `${delta > 0 ? "▲" : "▼"} ${pct}% frente al anterior`;
}

/** Gráfico SVG sencillo del historial real (mismo eje de unidades). */
function GraficoHistorial({ r }: { r: ResultadoCatalogo }) {
  if (r.historial.length < 2) {
    return <p className="font-body text-xs text-ink-dim">No existe historial suficiente para graficar esta variable.</p>;
  }
  const puntos = r.historial;
  const valores = puntos.map((p) => p.valor);
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const rango = max - min || 1;
  const W = 320;
  const H = 90;
  const paso = W / (puntos.length - 1);
  const coords = puntos.map((p, i) => `${i * paso},${H - 8 - ((p.valor - min) / rango) * (H - 20)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-24 w-full" role="img" aria-label={`Evolución de ${r.nombre}`}>
      <polyline points={coords} fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-blue" />
      {puntos.map((p, i) => (
        <circle key={i} cx={i * paso} cy={H - 8 - ((p.valor - min) / rango) * (H - 20)} r="3" className="fill-brand-lime" />
      ))}
    </svg>
  );
}

export function ResultadosCatalogo({ resultados }: { resultados: ResultadoCatalogo[] }) {
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState<string>("todas");
  const [estado, setEstado] = useState<string>("todos");
  const [abiertas, setAbiertas] = useState<Set<string>>(new Set(ORDEN_CATEGORIAS));
  const [detalle, setDetalle] = useState<ResultadoCatalogo | null>(null);

  const porCategoria = useMemo(() => {
    const mapa = new Map<string, ResultadoCatalogo[]>();
    for (const r of resultados) {
      const lista = mapa.get(r.categoria) ?? [];
      lista.push(r);
      mapa.set(r.categoria, lista);
    }
    return mapa;
  }, [resultados]);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return resultados.filter((r) => {
      if (q && !r.nombre.toLowerCase().includes(q)) return false;
      if (categoria !== "todas" && r.categoria !== categoria) return false;
      if (estado === "fuera" && !["debajo", "encima"].includes(estadoDesdeReferencia(r.valor, r.referencia))) return false;
      if (estado === "sin_rango" && estadoDesdeReferencia(r.valor, r.referencia) !== "sin_rango") return false;
      return true;
    });
  }, [resultados, busqueda, categoria, estado]);

  function alternar(cat: string) {
    const copia = new Set(abiertas);
    if (copia.has(cat)) copia.delete(cat);
    else copia.add(cat);
    setAbiertas(copia);
  }

  return (
    <section className="rounded-lg border border-clinical-border bg-panel p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-body text-xs font-semibold uppercase text-brand-blue">Catálogo de laboratorio</p>
          <h2 className="mt-1 font-display text-lg font-bold text-ink">Resultados por categoría</h2>
        </div>
        <span className="rounded border border-clinical-border bg-panel-soft px-2 py-1 font-mono text-[10px] text-ink-dim">Estructura compatible con FHIR</span>
      </div>

      {/* Buscador y filtros */}
      <div className="mb-5 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search className="absolute top-2.5 left-3 size-4 text-ink-dim" aria-hidden="true" />
          <Input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar biomarcador…" className="bg-panel pl-9" aria-label="Buscar biomarcador" />
        </div>
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="rounded-md border border-clinical-border bg-panel px-3 py-2 font-body text-sm text-ink" aria-label="Filtrar por categoría">
          <option value="todas">Todas las categorías</option>
          {ORDEN_CATEGORIAS.map((c) => <option key={c} value={c}>{ETIQUETA_CATEGORIA[c]}</option>)}
        </select>
        <select value={estado} onChange={(e) => setEstado(e.target.value)} className="rounded-md border border-clinical-border bg-panel px-3 py-2 font-body text-sm text-ink" aria-label="Filtrar por estado">
          <option value="todos">Todos los resultados</option>
          <option value="fuera">Solo fuera del rango</option>
          <option value="sin_rango">Sin rango de referencia</option>
        </select>
      </div>

      {resultados.length === 0 ? (
        <p className="rounded-lg border border-dashed border-clinical-border bg-panel-soft p-6 font-body text-sm text-ink-dim">
          Sin resultados registrados. Las variables del catálogo aparecerán aquí cuando suba un examen que las incluya.
        </p>
      ) : filtrados.length === 0 ? (
        <p className="rounded-lg border border-dashed border-clinical-border bg-panel-soft p-6 font-body text-sm text-ink-dim">
          Ningún resultado coincide con la búsqueda o los filtros.
        </p>
      ) : (
        ORDEN_CATEGORIAS.filter((c) => categoria === "todas" || categoria === c).map((cat) => {
          const todos = porCategoria.get(cat) ?? [];
          const visibles = filtrados.filter((r) => r.categoria === cat);
          if (todos.length === 0 && categoria === "todas" && !busqueda) return null;
          return (
            <div key={cat} className="mb-3 overflow-hidden rounded-md border border-clinical-border">
              <button type="button" onClick={() => alternar(cat)} className="flex w-full items-center justify-between bg-panel-soft px-4 py-3 text-left" aria-expanded={abiertas.has(cat)}>
                <span className="font-display text-sm font-bold text-ink">{ETIQUETA_CATEGORIA[cat]}</span>
                <span className="flex items-center gap-2 font-body text-xs text-ink-dim">
                  {visibles.length} resultado{visibles.length === 1 ? "" : "s"}
                  <ChevronDown className={`size-4 transition-transform ${abiertas.has(cat) ? "rotate-180" : ""}`} aria-hidden="true" />
                </span>
              </button>
              {abiertas.has(cat) && (
                <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
                  {visibles.length === 0 ? (
                    <p className="font-body text-xs text-ink-dim sm:col-span-2 lg:col-span-3">Sin resultados registrados en esta categoría con los filtros actuales.</p>
                  ) : visibles.map((r) => {
                    const est = estadoDesdeReferencia(r.valor, r.referencia);
                    const varia = variacion(r);
                    return (
                      <button key={r.codigo} type="button" onClick={() => setDetalle(r)} className="rounded-md border border-clinical-border bg-panel-soft p-4 text-left transition-shadow hover:shadow-md">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <span className="font-body text-xs font-semibold text-ink-dim">{r.nombre}</span>
                          <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold ring-1 ${CHIP_ESTADO[est]}`}>{ETIQUETA_ESTADO[est]}</span>
                        </div>
                        <p className="font-body text-2xl leading-none font-bold text-ink">
                          {r.valor}{r.unidad ? <span className="text-sm font-medium text-ink-dim"> {r.unidad}</span> : null}
                        </p>
                        <p className="mt-2 font-body text-[11px] text-ink-dim">{r.fecha}</p>
                        {r.referencia ? (
                          <p className="font-body text-[11px] text-ink-dim">Referencia del laboratorio: {r.referencia}</p>
                        ) : (
                          <p className="font-body text-[11px] text-ink-dim">Rango de referencia no disponible</p>
                        )}
                        {varia && <p className="mt-1 font-body text-[11px] font-semibold text-brand-blue">{varia}</p>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Panel de detalle */}
      {detalle && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center" role="dialog" aria-modal="true" aria-label={`Detalle de ${detalle.nombre}`} onClick={() => setDetalle(null)}>
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-lg border border-clinical-border bg-panel p-5 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="font-body text-xs font-semibold uppercase text-brand-blue">{ETIQUETA_CATEGORIA[detalle.categoria as keyof typeof ETIQUETA_CATEGORIA] ?? detalle.categoria}</p>
                <h3 className="font-display text-lg font-bold text-ink">{detalle.nombre}</h3>
              </div>
              <button type="button" onClick={() => setDetalle(null)} aria-label="Cerrar detalle" className="rounded p-1 text-ink-dim hover:bg-panel-soft"><X className="size-5" /></button>
            </div>
            <p className="font-body text-3xl font-bold text-ink">{detalle.valor}{detalle.unidad ? <span className="text-base font-medium text-ink-dim"> {detalle.unidad}</span> : null}</p>
            <dl className="mt-4 space-y-2 font-body text-sm">
              <div className="flex justify-between gap-3"><dt className="text-ink-dim">Fecha del examen</dt><dd className="font-semibold text-ink">{detalle.fecha}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-ink-dim">Estado analítico</dt><dd className="font-semibold text-ink">{ETIQUETA_ESTADO[estadoDesdeReferencia(detalle.valor, detalle.referencia)]}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-ink-dim">Rango de referencia</dt><dd className="text-right font-semibold text-ink">{detalle.referencia ?? "Rango de referencia no disponible"}</dd></div>
              {variacion(detalle) && <div className="flex justify-between gap-3"><dt className="text-ink-dim">Variación</dt><dd className="font-semibold text-brand-blue">{variacion(detalle)}</dd></div>}
            </dl>
            <div className="mt-5">
              <p className="mb-2 font-body text-xs font-semibold uppercase text-ink-dim">Evolución</p>
              <GraficoHistorial r={detalle} />
              {detalle.historial.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {[...detalle.historial].reverse().map((p, i) => (
                    <li key={i} className="flex justify-between font-body text-xs text-ink-dim"><span>{p.fecha}</span><span className="font-semibold text-ink">{p.valor}{detalle.unidad ? ` ${detalle.unidad}` : ""}</span></li>
                  ))}
                </ul>
              )}
            </div>
            <p className="mt-4 font-body text-[11px] text-ink-dim">Esta información es orientativa y debe ser validada por un profesional de la salud. No reemplaza el criterio médico.</p>
          </div>
        </div>
      )}
    </section>
  );
}
