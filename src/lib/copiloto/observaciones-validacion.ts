import { z } from 'zod';

export const esquemaObservacion = z.object({
  pacienteId: z.string().uuid(),
  examenId: z.string().uuid(),
  mensaje: z.string().trim().min(1, 'Escriba una observación.').max(2000, 'Máximo 2000 caracteres.'),
});

export function puedeAnotar(rolMedico: boolean, accesoActivo: boolean, examenPropioPaciente: boolean) {
  return rolMedico && accesoActivo && examenPropioPaciente;
}