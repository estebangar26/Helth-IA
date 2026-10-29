import { describe,it,expect } from 'vitest';
import { apoyo } from './apoyo';
import type { Catalogo,Food,Lectura,Rule } from './tipos';
const r=(codigo:string,valor=10,estado:Lectura['estado']='encima',categoria='renal'):Lectura=>({codigo,nombre:codigo,valor,estado,categoria,unidad:'mg/dL',referencia:null,fecha:'',examenId:'x',historial:[]});
const foods:Food[]=['higado','frijoles','espinaca','banano','aguacate','manzana','pera','pina','mora','fresa','uvas','naranja','guayaba','maracuya','papaya','coco','lacteos','gaseosa_oscura','mani','nueces'].map(id=>({id,nombre:id,categoria:'fruta colombiana',nutriente_clave:'',por_que:'',como_comerlo:'',image_url:null,image_credit:null,tags_restriccion:id==='higado'?['purinas_altas']:['frijoles','espinaca','banano','aguacate'].includes(id)?['potasio_alto']:[]}));
const rule=(id:string,analitos:string[],recomendados:string[],estados=['encima','debajo']):Rule=>({id,analitos,recomendados,estados,categorias:[],limitar:[],mensaje:'Consulta con tu médico.',consejo:''});
const catalogo:Catalogo={foods,places:[],rules:[rule('hierro',['hemoglobina'],['higado','frijoles','espinaca']),rule('glucosa',['glucemia_ayunas','hba1c'],['banano','aguacate','manzana']),rule('renal',['tfg','creatinina'],[]),{...rule('hormonas',[],[]),categorias:['hormonal']},{...rule('tumorales',[],[]),categorias:['tumoral']}]};
describe('Alimentación consume estados existentes y prioriza restricciones',()=>{
 it('ofrece alimentos para HbA1c controlada y glucosa en observación',()=>{expect(apoyo(r('hba1c',6,'controlado','glucosa'),[],catalogo).recomendados.map(f=>f.id)).toContain('manzana');expect(apoyo(r('glucemia_ayunas',130,'observacion','glucosa'),[],catalogo).recomendados.map(f=>f.id)).toContain('manzana');});
 it('no inventa dirección ni recomienda hierro para hemoglobina en observación',()=>{const c={...catalogo,rules:[rule('hierro',['hemoglobina'],['higado'],['debajo'])]};expect(apoyo(r('hemoglobina',10,'observacion','hemograma'),[],c).recomendados).toEqual([]);});
 it('testosterona en observación no recibe alimentos correctivos',()=>{expect(apoyo(r('testosterona_total',214,'observacion','hormonal'),[],catalogo).recomendados).toEqual([]);});
 it('no recomienda para resultados dentro del rango ni sin referencia',()=>{expect(apoyo(r('hba1c',7,'dentro','glucosa'),[],catalogo).recomendados).toEqual([]);expect(apoyo(r('hba1c',7,'sin_rango','glucosa'),[],catalogo).recomendados).toEqual([]);});
 it('no deduce estado de valor o referencia',()=>{const lectura={...r('hemoglobina',8,'dentro','hemograma'),referencia:'12–16'};expect(apoyo(lectura,[lectura],catalogo).recomendados).toEqual([]);expect(lectura.estado).toBe('dentro');});
 it('retira hígado ante ácido úrico alto',()=>{const x=r('hemoglobina',8,'debajo','hemograma');expect(apoyo(x,[x,r('acido_urico')],catalogo).recomendados.map(f=>f.id)).not.toContain('higado');});
 it('retira fríjoles y espinaca ante alteración renal',()=>{const x=r('hemoglobina',8,'debajo','hemograma');const ids=apoyo(x,[x,r('creatinina')],catalogo).recomendados.map(f=>f.id);expect(ids).not.toContain('frijoles');expect(ids).not.toContain('espinaca');});
 it('retira banano y aguacate ante alteración renal',()=>{const x=r('hba1c',8,'encima','glucosa');const ids=apoyo(x,[x,r('creatinina')],catalogo).recomendados.map(f=>f.id);expect(ids).not.toContain('banano');expect(ids).not.toContain('aguacate');});
 it.each([45,59])('TFG %s admite lista de menor potasio',valor=>{const x=r('tfg',valor,'debajo');expect(apoyo(x,[x],catalogo).recomendados.map(f=>f.id)).toEqual(['manzana','pera','pina','mora','fresa','uvas']);});
 it('TFG 44 elimina todas las listas positivas incluso para otra variable',()=>{const x=r('hemoglobina',8,'debajo','hemograma');expect(apoyo(x,[x,r('tfg',44,'debajo')],catalogo).recomendados).toEqual([]);});
 it('TFG 60 no activa lista 45–59',()=>{const x=r('tfg',60,'debajo');expect(apoyo(x,[x],catalogo).recomendados).toEqual([]);});
 it('glucosa 69 activa regla 15; 70 no',()=>{const x=r('glucemia_ayunas',69,'debajo','glucosa');expect(apoyo(x,[x],catalogo).mensaje).toContain('15 minutos');expect(apoyo({...x,valor:70},[x],catalogo).mensaje).not.toContain('15 minutos');});
 it('glucosa 39 solicita atención inmediata sin reclasificar',()=>{const x=r('glucemia_ayunas',39,'debajo','glucosa');expect(apoyo(x,[x],catalogo).mensaje).toContain('123');expect(x.estado).toBe('debajo');});
 it('no aplica regla 15 a mmol/L sin conversión autorizada',()=>{const x={...r('glucemia_ayunas',3,'debajo','glucosa'),unidad:'mmol/L'};expect(apoyo(x,[x],catalogo).mensaje).not.toContain('15 minutos');});
 it.each(['hormonal','tumoral'])('no ofrece alimentos para %s',cat=>{const x=r('marcador',20,'encima',cat);expect(apoyo(x,[x],catalogo).recomendados).toEqual([]);});
});
describe('Caso hemoglobina baja + creatinina alta',()=>{
 it('excluye hígado y banano con etiquetas reales del catálogo',()=>{
  const f=(id:string,t:string[]):Food=>({id,nombre:id,categoria:'proteína',nutriente_clave:'',por_que:'',como_comerlo:'',image_url:null,image_credit:null,tags_restriccion:t as Food['tags_restriccion']});
  const c:Catalogo={foods:[f('higado',['proteina_alta','purinas_altas']),f('banano',['potasio_alto','azucar_alta']),f('lentejas',[]),f('guayaba',[])],places:[],rules:[rule('hierro',['hemoglobina'],['higado','banano','lentejas','guayaba'],['debajo'])]};
  const hb=r('hemoglobina',9,'debajo','hemograma');const ids=apoyo(hb,[hb,r('creatinina',2.1,'encima')],c).recomendados.map(x=>x.id);
  expect(ids).not.toContain('higado');expect(ids).not.toContain('banano');expect(ids).toEqual(['lentejas','guayaba']);
 });
});
