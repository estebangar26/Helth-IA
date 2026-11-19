import { describe, it, expect } from 'vitest';
import { enviarRecordatorio, textoRecordatorio, type PuertoRecordatorios } from './recordatorios.server';
import { configuracion } from '@/lib/medicaciones/modelo';

const c = configuracion.parse({ cantidad: 120, unidad: 'mg', inicio: '2026-11-19', primera: '08:00', prescrito: 'Dra. Ruiz' });
const toma = '2026-11-19T13:00:00.000Z';
const base = { chatId: 555, medicationId: 'm1', nombre: 'Desmopresina', config: c, scheduledAt: toma };

/** Falso acceso a la tabla: registra qué se marcó y qué se liberó. */
function puertoFalso({ yaMarcada = false }: { yaMarcada?: boolean } = {}) {
  const marcadas: unknown[] = [];
  const liberadas: unknown[] = [];
  const puerto: PuertoRecordatorios = {
    marcarEnviada: async (marca) => { marcadas.push(marca); return yaMarcada ? new Error('duplicate key') : null; },
    quitarMarca: async (marca) => { liberadas.push(marca); },
  };
  return { puerto, marcadas, liberadas };
}

describe('Recordatorios de medicación por Telegram', () => {
  it('avisa una sola vez: si la toma ya está marcada, no vuelve a enviar', async () => {
    const { puerto, liberadas } = puertoFalso({ yaMarcada: true });
    let enviadas = 0;
    const ok = await enviarRecordatorio({ ...base, puerto, enviar: async () => { enviadas++; } });
    expect(ok).toBe(false);
    expect(enviadas).toBe(0);
    expect(liberadas).toEqual([]);
  });

  it('si el envío falla, libera la marca para que la próxima revisión reintente', async () => {
    const { puerto, liberadas } = puertoFalso();
    const ok = await enviarRecordatorio({ ...base, puerto, enviar: async () => { throw new Error('Telegram [400]: chat no encontrado'); } });
    expect(ok).toBe(false);
    expect(liberadas).toEqual([{ medication_id: 'm1', scheduled_at: toma }]);
  });

  it('conserva la marca cuando el mensaje sí llegó', async () => {
    const { puerto, marcadas, liberadas } = puertoFalso();
    const ok = await enviarRecordatorio({ ...base, puerto, enviar: async () => {} });
    expect(ok).toBe(true);
    expect(marcadas).toEqual([{ medication_id: 'm1', scheduled_at: toma }]);
    expect(liberadas).toEqual([]);
  });

  it('muestra el médico que indicó el medicamento', () => {
    expect(textoRecordatorio('Desmopresina', c, toma)).toContain('Indicado por: Dra. Ruiz');
  });

  it('no muestra la dosis si el paciente no activó esa opción', () => {
    const sinDosis = configuracion.parse({ ...c, incluirDosis: false });
    expect(textoRecordatorio('Desmopresina', sinDosis, toma)).not.toContain('120');
  });
});
