/**
 * TIPOS COMPARTIDOS (contrato entre backend y frontend)
 * -----------------------------------------------------
 * Este archivo NO contiene lógica: solo describe la forma de los datos que el
 * backend entrega y que el frontend consume. Al ser el único punto en común,
 * cambiar un campo aquí obliga a actualizar ambas capas de forma explícita.
 */

/** Clasificación de riesgo (triage) producida por el motor de reglas. */
export type NivelRiesgo = "ok" | "warn" | "alert";

/** Datos básicos del paciente mostrados en el encabezado. */
export interface Paciente {
  nombre: string;
  edad: number;
  /** Identificador del paciente dentro del programa. */
  documento: string;
  /** Fecha de la última actualización de datos, ya formateada para mostrar. */
  actualizado: string;
}

/** Un biomarcador con su valor más reciente y su lectura clínica. */
export interface Biomarcador {
  nombre: string;
  valor: string;
  /** Unidad de medida; algunos valores (p. ej. presión) no la usan. */
  unidad?: string;
  /** Texto corto que explica la tendencia y la meta clínica. */
  nota: string;
  nivel: NivelRiesgo;
}

/** Un valor individual dentro de un examen de laboratorio. */
export interface ValorExamen {
  etiqueta: string;
  valor: string;
  /** Si está presente, el valor se resalta con el color del nivel indicado. */
  resaltado?: NivelRiesgo;
}

/** Un examen dentro de la línea de tiempo del paciente. */
export interface Examen {
  id: string;
  titulo: string;
  /** Fecha ya formateada en español. */
  fecha: string;
  nivel: NivelRiesgo;
  valores: ValorExamen[];
}

/** Resultado del motor de reglas: nivel + explicación legible. */
export interface EvaluacionRiesgo {
  nivel: NivelRiesgo;
  /** Titular corto del estado, p. ej. "HbA1c sobre la meta". */
  titular: string;
  /** Explicación en lenguaje claro para el paciente. */
  explicacion: string;
  /** Reglas que se activaron, para dejar la decisión auditable. */
  reglasAplicadas: string[];
}

/** Todo lo que la pantalla principal necesita en una sola respuesta. */
export interface PanelPaciente {
  paciente: Paciente;
  evaluacion: EvaluacionRiesgo;
  biomarcadores: Biomarcador[];
  examenes: Examen[];
  recomendaciones: string[];
}
