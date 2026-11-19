import { z } from "zod";

/** Validación compartida: el navegador orienta y el servidor vuelve a verificar todo. */
export const contactoSchema = z.object({
  nombre: z.string().trim().min(2, "Escribe tu nombre").max(100, "Máximo 100 caracteres"),
  email: z.string().trim().toLowerCase().email("Escribe un correo válido").max(254, "Máximo 254 caracteres"),
  tipo: z.enum(["contacto", "opinion", "peticion", "queja", "reclamo", "sugerencia"]),
  mensaje: z.string().trim().min(10, "Cuéntanos un poco más (mínimo 10 caracteres)").max(2000, "Máximo 2000 caracteres"),
  website: z.string().max(0).optional(),
});

export type ContactoDatos = z.infer<typeof contactoSchema>;

export const tiposContacto = [
  { valor: "opinion", etiqueta: "Opinión" },
  { valor: "peticion", etiqueta: "Petición" },
  { valor: "queja", etiqueta: "Queja" },
  { valor: "reclamo", etiqueta: "Reclamo" },
  { valor: "sugerencia", etiqueta: "Sugerencia" },
  { valor: "contacto", etiqueta: "Contacto general" },
] as const;
