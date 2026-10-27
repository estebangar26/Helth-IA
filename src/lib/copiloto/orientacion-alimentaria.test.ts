import { describe, it, expect } from 'vitest';
import { estadoAnalitico, orientarResultado } from './orientacion-alimentaria';
import { puedeAnotar, esquemaObservacion } from './observaciones-validacion';
import type { ResultadoCatalogo } from './tipos';

const resultado: ResultadoCatalogo = { codigo: 'creatinina', nombre: 'Creatinina', categoria: 'renal', valor: 0.4, unidad: 'mg/dL', referencia: '0.6 - 1.2', fecha: '27 de octubre de 2026', examenId: 'examen', historial: [] };
describe('Orientación ligada al laboratorio', () => {
  it('identifica creatinina baja sin prescribir proteína', () => {
    const orientacion = orientarResultado(resultado);
    expect(orientacion.estado).toBe('debajo');
    expect(orientacion.texto).toContain('no confirma falta de proteína');
    expect(orientacion.texto).toContain('Consulte antes de aumentar');
  });
  it('no clasifica una variable sin referencia', () => expect(orientarResultado({ ...resultado, referencia: null }).estado).toBe('sin_rango'));
  it('solo interpreta intervalos explícitos, no referencias ambiguas', () => {
    expect(estadoAnalitico(5, '3-7')).toBe('dentro');
    expect(estadoAnalitico(2, '3–7')).toBe('debajo');
    expect(estadoAnalitico(8, '3 a 7')).toBe('encima');
    expect(estadoAnalitico(5, 'Hombres 3-7; Mujeres 2-6')).toBe('sin_rango');
    expect(estadoAnalitico(5, '7 - 3')).toBe('sin_rango');
    expect(estadoAnalitico(7, '< 7')).toBe('encima');
  });
  it('selecciona alimentos solo para glucosa alta, no para insulina aislada', () => {
    expect(orientarResultado({ ...resultado, categoria: 'glucosa', codigo: 'glucemia_ayunas', valor: 130, referencia: '70 - 100' }).texto).toContain('fruta entera');
    expect(orientarResultado({ ...resultado, categoria: 'glucosa', codigo: 'insulina', valor: 130, referencia: '2 - 25' }).texto).not.toContain('fruta entera en lugar');
  });
});
describe('Permisos para observaciones médicas', () => {
  it('permite únicamente médico con acceso activo y examen del paciente', () => expect(puedeAnotar(true, true, true)).toBe(true));
  it('rechaza pacientes u otros roles', () => expect(puedeAnotar(false, true, true)).toBe(false));
  it('rechaza acceso revocado', () => expect(puedeAnotar(true, false, true)).toBe(false));
  it('rechaza examen de otro paciente', () => expect(puedeAnotar(true, true, false)).toBe(false));
  it('rechaza mensajes vacíos y limita la longitud', () => {
    const ids = { pacienteId: '11111111-1111-4111-8111-111111111111', examenId: '22222222-2222-4222-8222-222222222222' };
    expect(esquemaObservacion.safeParse({ ...ids, mensaje: ' ' }).success).toBe(false);
    expect(esquemaObservacion.safeParse({ ...ids, mensaje: 'a'.repeat(2001) }).success).toBe(false);
    expect(esquemaObservacion.safeParse({ ...ids, mensaje: 'a'.repeat(2000) }).success).toBe(true);
  });
});