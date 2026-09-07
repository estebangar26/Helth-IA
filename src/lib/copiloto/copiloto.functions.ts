/**
 * BACKEND · PUNTO DE ENTRADA (API interna)
 * ----------------------------------------
 * Única puerta que el frontend usa para pedir datos al servidor.
 * `createServerFn` genera una llamada remota tipada: el cuerpo del `.handler()`
 * se ejecuta SIEMPRE en el servidor, así que los datos clínicos y las reglas
 * nunca se envían al navegador, solo el resultado ya calculado.
 */

import { createServerFn } from "@tanstack/react-start";

import type { PanelPaciente } from "./tipos";

/** Devuelve todo lo que la pantalla del paciente necesita en una sola llamada. */
export const obtenerPanelPaciente = createServerFn({ method: "GET" }).handler(
  async (): Promise<PanelPaciente> => {
    // Se importan dentro del handler para asegurar que estos módulos de
    // servidor no entren nunca en el paquete que se descarga en el navegador.
    const datos = await import("./datos.server");
    const { evaluarRiesgo } = await import("./triage.server");

    const mediciones = datos.obtenerMedicionesActuales();

    return {
      paciente: datos.obtenerPaciente(),
      // El nivel de riesgo se calcula en el servidor con el motor de reglas.
      evaluacion: evaluarRiesgo(mediciones),
      biomarcadores: datos.obtenerBiomarcadores(),
      examenes: datos.obtenerExamenes(),
      recomendaciones: datos.obtenerRecomendaciones(),
    };
  },
);
