/** Envío de recordatorios de toma por Telegram, con reintento si el envío falla. */
import { horaLocal, type Config } from '@/lib/medicaciones/modelo';

/** Fila que marca que una toma ya fue avisada. */
export type Marca = { medication_id: string; scheduled_at: string };

/**
 * Acceso a la tabla de tomas avisadas, resuelto por quien llama.
 * marcarEnviada devuelve un error si la toma ya estaba registrada.
 */
export type PuertoRecordatorios = {
  marcarEnviada(marca: Marca): Promise<unknown>;
  quitarMarca(marca: Marca): Promise<unknown>;
};

/** Texto del aviso: medicamento, hora y médico que lo indicó. */
export function textoRecordatorio(nombre: string, c: Config, scheduledAt: string): string {
  const dosis = c.incluirDosis ? ` (${c.porToma} × ${c.cantidad} ${c.unidad})` : '';
  const medico = c.prescrito ? `\nIndicado por: ${c.prescrito}` : '';
  return `💊 Recordatorio HelthIA\n${nombre}${dosis}\nHora: ${horaLocal(scheduledAt)}${medico}\n\nNo cambies la dosis sin consultar a tu médico.`;
}

/**
 * Marca la toma como avisada, la envía y, si el envío falla, libera la marca
 * para que la siguiente revisión (cada 15 minutos) la vuelva a intentar.
 * Devuelve true solo cuando el mensaje llegó.
 */
export async function enviarRecordatorio(args: {
  puerto: PuertoRecordatorios;
  chatId: number;
  medicationId: string;
  nombre: string;
  config: Config;
  scheduledAt: string;
  enviar: (chatId: number, texto: string) => Promise<void>;
}): Promise<boolean> {
  const { puerto, chatId, medicationId, nombre, config, scheduledAt, enviar } = args;
  const marca: Marca = { medication_id: medicationId, scheduled_at: scheduledAt };
  if (await puerto.marcarEnviada(marca)) return false; // esa toma ya fue avisada
  try {
    await enviar(chatId, textoRecordatorio(nombre, config, scheduledAt));
    return true;
  } catch (e) {
    // Sin esto la toma quedaría marcada como enviada para siempre y el paciente nunca la recibiría.
    await puerto.quitarMarca(marca);
    console.error('Fallo el envío del recordatorio; se reintentará en la próxima revisión:', e);
    return false;
  }
}
