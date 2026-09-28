/**
 * BACKEND · FUENTE DE DATOS
 * -------------------------
 * Archivo de servidor (nunca llega al navegador, por el sufijo `.server`).
 * Hoy devuelve datos de ejemplo en memoria; cuando se conecte la base de datos
 * solo hay que reemplazar el cuerpo de estas funciones manteniendo los tipos.
 */

import type { Biomarcador, Examen, Paciente } from "./tipos";

/** Datos del paciente en seguimiento (demo). */
export function obtenerPaciente(): Paciente {
  return {
    nombre: "María Fernanda Restrepo",
    edad: 64,
    documento: "CO-2024-0847",
    actualizado: "12 mar 2025",
    tipoAtencion: "privado",
    epsNombre: null,
    medicoFamilia: null,
    medicoTratante: "Dra. Laura Martínez",
  };
}

/**
 * Mediciones crudas más recientes.
 * Se separan de los biomarcadores "presentables" porque el motor de reglas
 * necesita números, no textos.
 */
export interface MedicionesActuales {
  glucemiaAyunas: number; // mg/dL
  hba1c: number; // %
  presionSistolica: number; // mmHg
  presionDiastolica: number; // mmHg
}

export function obtenerMedicionesActuales(): MedicionesActuales {
  return {
    glucemiaAyunas: 108,
    hba1c: 7.8,
    presionSistolica: 142,
    presionDiastolica: 88,
  };
}

/** Tarjetas de biomarcadores ya listas para mostrar. */
export function obtenerBiomarcadores(): Biomarcador[] {
  return [
    {
      nombre: "Glucemia ayunas",
      valor: "108",
      unidad: "mg/dL",
      nota: "Estable · objetivo < 110",
      nivel: "ok",
    },
    {
      nombre: "HbA1c",
      valor: "7.8",
      unidad: "%",
      nota: "Sube 0.4% · meta < 7.0%",
      nivel: "warn",
    },
    {
      nombre: "Presión arterial",
      valor: "142/88",
      nota: "Sube · meta < 130/80",
      nivel: "warn",
    },
  ];
}

/** Historial de exámenes, del más reciente al más antiguo. */
export function obtenerExamenes(): Examen[] {
  return [
    {
      id: "ex-2025-03-12",
      titulo: "Panel de control · Laboratorio San Rafael",
      fecha: "12 de marzo de 2025",
      nivel: "warn",
      valores: [
        { etiqueta: "Glucemia", valor: "108 mg/dL" },
        { etiqueta: "HbA1c", valor: "7.8 %", resaltado: "warn" },
        { etiqueta: "Creatinina", valor: "0.9 mg/dL" },
      ],
    },
    {
      id: "ex-2024-12-10",
      titulo: "Controles intermedios · Clínica Metabólica",
      fecha: "10 de diciembre de 2024",
      nivel: "ok",
      valores: [
        { etiqueta: "Glucemia", valor: "101 mg/dL" },
        { etiqueta: "HbA1c", valor: "7.4 %", resaltado: "ok" },
        { etiqueta: "Presión", valor: "138/84" },
      ],
    },
    {
      id: "ex-2024-09-08",
      titulo: "Ingreso al programa · Hospital Pablo Tobón",
      fecha: "8 de septiembre de 2024",
      nivel: "alert",
      valores: [
        { etiqueta: "Glucemia", valor: "134 mg/dL" },
        { etiqueta: "HbA1c", valor: "8.6 %", resaltado: "alert" },
        { etiqueta: "Presión", valor: "148/92" },
      ],
    },
  ];
}

/**
 * Recomendaciones nutricionales con alimentos colombianos.
 * En el proyecto final este bloque será generado por el componente de IA;
 * por eso se aísla aquí y no se mezcla con el motor de reglas.
 */
export function obtenerRecomendaciones(): string[] {
  return [
    "Preferir arepa de maíz con plátano maduro en el desayuno; reduce el índice glucémico frente a pan blanco.",
    "En la cena, sustituir arroz por quinoa con el aguacate en la ensalada; ayuda a estabilizar la glucosa nocturna.",
    "Como merienda, cambie el dulce por un puñado de guayaba con chía; acompaña con agua de coco sin azúcar.",
  ];
}
