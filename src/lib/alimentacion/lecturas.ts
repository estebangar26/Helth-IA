/** Une las dos vistas existentes sin inventar rangos ni reclasificar el triage. */
import type { Biomarcador, Examen, ResultadoCatalogo } from '@/lib/copiloto/tipos';
import { CATALOGO_ANALITOS } from '@/lib/copiloto/catalogo-resultados';
import { estadoDesdeReferencia } from '@/components/copiloto/ResultadosCatalogo';
import type { Lectura } from './tipos';

export const muestraApoyo = (r: Lectura) => ['debajo', 'encima', 'observacion', 'accion'].includes(r.estado)
  || (r.estado === 'controlado' && ['glucemia_ayunas', 'hba1c'].includes(r.codigo));

export function lecturasAlimentacion(resultados: ResultadoCatalogo[], biomarcadores: Biomarcador[], examenes: Examen[]): Lectura[] {
  const lecturas: Lectura[] = resultados.map(r => ({ ...r, estado: estadoDesdeReferencia(r.valor, r.referencia, r.nombre) }));
  for (const b of biomarcadores) {
    const def = CATALOGO_ANALITOS.find(a => a.nombre === b.nombre || (a.codigo === 'hba1c' && b.nombre === 'HbA1c'));
    const valor = Number(b.valor);
    if (!def || !Number.isFinite(valor)) continue;
    const existente = lecturas.find(r => r.codigo === def.codigo);
    // No mezclar el triage de otro resultado o de otra unidad con el catálogo.
    if (existente && (existente.valor !== valor || existente.unidad !== (b.unidad ?? null))) continue;
    const estado = b.nivel === 'warn' ? 'observacion' : b.nivel === 'alert' ? 'accion'
      : ['glucemia_ayunas', 'hba1c'].includes(def.codigo) ? 'controlado' : 'sin_rango';
    if (existente) {
      if (existente.estado === 'sin_rango') existente.estado = estado;
      else if (existente.estado === 'dentro' && estado !== 'sin_rango') existente.estado = estado;
      continue;
    }
    const examen = examenes.find(e => e.valores.some(v => v.etiqueta === b.nombre && Number(v.valor.split(/\s/)[0]) === valor));
    if (!examen) continue;
    lecturas.push({ codigo: def.codigo, nombre: b.nombre, categoria: def.categoria, valor,
      unidad: b.unidad ?? null, referencia: null, fecha: examen.fecha, examenId: examen.id, historial: [], estado });
  }
  return lecturas;
}