/** Solo consume el estado recibido: no analiza ni modifica rangos. */
import type { Catalogo, Lectura } from './tipos';
const renal = (r: Lectura) => ['creatinina','tfg','bun','urea','cistatina_c'].includes(r.codigo) && ['debajo','encima'].includes(r.estado);
export function apoyo(r: Lectura, todos: Lectura[], c: Catalogo) {
 const alterado = ['debajo','encima'].includes(r.estado);
 const regla = c.rules.find(x => x.analitos.includes(r.codigo) && x.estados.includes(r.estado)) ?? c.rules.find(x => x.categorias.includes(r.categoria) && x.estados.includes(r.estado));
 let ids = alterado ? [...(regla?.recomendados ?? [])] : [];
 let limitar = alterado ? [...(regla?.limitar ?? [])] : [];
 let mensaje = regla?.mensaje ?? 'La alimentación no corrige este valor de forma confiable; consulta con tu médico.';
 let consejo = regla?.consejo ?? '';
 const tfg = todos.find(x => x.codigo === 'tfg');
 const glucosa = /^(glucemia_|glucosa_)/.test(r.codigo);
 // Estas cifras guían primeros auxilios o precauciones, nunca cambian el estado clínico.
 if (alterado && glucosa && r.unidad === 'mg/dL' && r.valor < 70) {
  ids=[]; limitar=[];
  mensaje='Regla del 15: si está consciente y puede tragar, tome unos 15 g de carbohidrato rápido (media taza de jugo de fruta o una cucharada de azúcar disuelta en agua), vuelva a medir en 15 minutos y siga su plan médico.';
  consejo='Si hay confusión o desmayo, no dé alimentos ni líquidos por boca. Busca atención médica inmediata (línea 123 en Colombia).';
  if(r.valor < 40) mensaje='Busca atención médica inmediata (línea 123 en Colombia). Si está consciente y puede tragar, siga su plan médico para hipoglucemia; no demore la atención.';
 } else if (renal(r) && r.codigo === 'tfg' && r.valor >= 45 && r.valor < 60) {
  ids=['manzana','pera','pina','mora','fresa','uvas']; consejo+=' Estas frutas suelen aportar menos potasio; confirma con un nutricionista renal.';
 }
 if (tfg && renal(tfg) && tfg.valor < 45) {
  ids=[]; limitar=[...limitar,'banano','aguacate','naranja','guayaba','maracuya','papaya','coco','lacteos','gaseosa_oscura','mani','nueces'];
  consejo+=' Mejor limitar solo si tu nefrólogo lo indica. Pide un plan a un nutricionista renal.';
 }
 const restricciones = new Set<string>();
 if(todos.some(renal)) ['potasio_alto','fosforo_alto','proteina_alta'].forEach(x=>restricciones.add(x));
 if(todos.some(x=>x.codigo==='potasio' && x.estado==='encima')) restricciones.add('potasio_alto');
 if(todos.some(x=>x.codigo==='fosforo' && x.estado==='encima')) restricciones.add('fosforo_alto');
 if(todos.some(x=>x.codigo==='acido_urico' && x.estado==='encima')) restricciones.add('purinas_altas');
 if(todos.some(x=>x.categoria==='glucosa' && x.estado==='encima')) restricciones.add('azucar_alta');
 const conflictos = c.foods.filter(f=>ids.includes(f.id) && f.tags_restriccion.some(t=>restricciones.has(t)));
 const recomendados = c.foods.filter(f=>ids.includes(f.id) && !conflictos.includes(f) && !limitar.includes(f.id));
 const limitados = c.foods.filter(f=>limitar.includes(f.id) || conflictos.includes(f));
 return {recomendados,limitados,mensaje,consejo,precaucion:'En embarazo, lactancia, alergias o enfermedad renal conocida: Consulta a un nutricionista antes de cambiar tu dieta.'};
}
