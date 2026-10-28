import { describe, it, expect } from 'vitest';
import { lecturasAlimentacion, muestraApoyo } from './lecturas';
import type { Biomarcador, Examen, ResultadoCatalogo } from '@/lib/copiloto/tipos';
const biomarkers: Biomarcador[] = [
 { nombre:'Glucemia en ayunas', valor:'96', unidad:'mg/dL', nivel:'ok', nota:'Sin cambio' },
 { nombre:'Testosterona total', valor:'214', unidad:'ng/dL', nivel:'warn', nota:'Referencia 300–1000' },
 { nombre:'Testosterona libre', valor:'6.2', unidad:'pg/mL', nivel:'warn', nota:'Referencia 9–30' },
];
const exams: Examen[] = [{ id:'real', titulo:'Laboratorio', fecha:'26 de octubre de 2026', nivel:'warn', valores:biomarkers.map(b=>({etiqueta:b.nombre,valor:`${b.valor} ${b.unidad}`})) }];
describe('Alimentación usa los estados del dashboard',()=>{
 it('incluye testosterona 214 y 6.2 en observación aunque no exista rango en el catálogo',()=>{
  const readings=lecturasAlimentacion([],biomarkers,exams).filter(muestraApoyo);
  expect(readings.filter(r=>r.estado==='observacion').map(r=>r.valor)).toEqual([214,6.2]);
  expect(readings.every(r=>r.referencia===null)).toBe(true);
 });
 it('incluye glucosa 96 controlada pero no otras variables controladas',()=>{
  expect(lecturasAlimentacion([],biomarkers,exams).filter(r=>r.estado==='controlado').map(r=>r.codigo)).toEqual(['glucemia_ayunas']);
  expect(muestraApoyo({codigo:'testosterona_total',estado:'controlado'} as ResultadoCatalogo & {estado:'controlado'})).toBe(false);
 });
 it('conserva identidad y estado analítico fuera de rango del catálogo',()=>{
  const result:ResultadoCatalogo={codigo:'testosterona_total',nombre:'Testosterona total',categoria:'hormonal',valor:214,unidad:'ng/dL',referencia:'300–1000',fecha:'hoy',examenId:'original',historial:[]};
  const readings=lecturasAlimentacion([result],biomarkers,exams);
  expect(readings.find(r=>r.codigo===result.codigo)).toEqual({...result,estado:'debajo'});
  expect(readings.filter(r=>r.codigo===result.codigo)).toHaveLength(1);
 });
 it('no aplica triage de un valor anterior a un resultado distinto',()=>{
  const result:ResultadoCatalogo={codigo:'testosterona_total',nombre:'Testosterona total',categoria:'hormonal',valor:500,unidad:'ng/dL',referencia:null,fecha:'hoy',examenId:'nuevo',historial:[]};
  expect(lecturasAlimentacion([result],biomarkers,exams).find(r=>r.codigo===result.codigo)?.estado).toBe('sin_rango');
 });
});