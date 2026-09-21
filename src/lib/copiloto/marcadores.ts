/**
 * CONTRATO COMPARTIDO · BIOMARCADORES SOPORTADOS
 * ----------------------------------------------
 * Un único lugar define qué se mide, con qué unidad y con qué rango de
 * referencia. Lo usan la lectura automática del archivo, el motor de alertas y
 * la presentación en pantalla, de modo que nunca se desincronicen.
 */

/** Categorías clínicas que la aplicación reconoce hoy. */
export type TipoExamen =
  | "diabetes_tipo_1"
  | "diabetes_tipo_2"
  | "diabetes_insipida"
  | "marcadores_cancer"
  | "testosterona"
  | "general";

/** Etiquetas legibles de cada categoría. */
export const ETIQUETA_TIPO: Record<TipoExamen, string> = {
  diabetes_tipo_1: "Diabetes tipo 1",
  diabetes_tipo_2: "Diabetes tipo 2",
  diabetes_insipida: "Diabetes insípida",
  marcadores_cancer: "Biomarcadores de cáncer",
  testosterona: "Testosterona",
  general: "Examen general",
};

/** Definición de un biomarcador y su rango esperado. */
export interface DefinicionMarcador {
  /** Nombre de la columna en la base de datos. */
  campo: string;
  etiqueta: string;
  unidad: string;
  /** Valor mínimo esperado; por debajo se considera alterado. */
  min?: number;
  /** Valor máximo esperado; por encima se considera alterado. */
  max?: number;
  /** Umbral desde el cual el hallazgo es claramente severo. */
  severo?: number;
  /** Si es true, el hallazgo severo ocurre por valores bajos. */
  severoPorDebajo?: boolean;
  tipos: TipoExamen[];
}

/** Catálogo completo de biomarcadores soportados. */
export const MARCADORES: DefinicionMarcador[] = [
  // Diabetes (tipo 1 y tipo 2)
  { campo: "glucemia_ayunas", etiqueta: "Glucemia en ayunas", unidad: "mg/dL", max: 125, severo: 180, tipos: ["diabetes_tipo_1", "diabetes_tipo_2", "general"] },
  { campo: "glucemia_posprandial", etiqueta: "Glucemia posprandial", unidad: "mg/dL", max: 179, severo: 250, tipos: ["diabetes_tipo_1", "diabetes_tipo_2"] },
  { campo: "hba1c", etiqueta: "HbA1c", unidad: "%", max: 6.4, severo: 8.5, tipos: ["diabetes_tipo_1", "diabetes_tipo_2", "general"] },
  { campo: "insulina", etiqueta: "Insulina basal", unidad: "µU/mL", min: 2, max: 25, tipos: ["diabetes_tipo_1", "diabetes_tipo_2"] },
  { campo: "peptido_c", etiqueta: "Péptido C", unidad: "ng/mL", min: 0.9, max: 4.3, severo: 0.5, severoPorDebajo: true, tipos: ["diabetes_tipo_1"] },
  { campo: "anticuerpos_gad", etiqueta: "Anticuerpos anti-GAD", unidad: "UI/mL", max: 5, severo: 30, tipos: ["diabetes_tipo_1"] },

  // Diabetes insípida
  { campo: "sodio", etiqueta: "Sodio sérico", unidad: "mEq/L", min: 135, max: 145, severo: 150, tipos: ["diabetes_insipida"] },
  { campo: "osmolaridad_plasmatica", etiqueta: "Osmolaridad plasmática", unidad: "mOsm/kg", min: 275, max: 295, severo: 305, tipos: ["diabetes_insipida"] },
  { campo: "osmolaridad_urinaria", etiqueta: "Osmolaridad urinaria", unidad: "mOsm/kg", min: 300, max: 900, severo: 200, severoPorDebajo: true, tipos: ["diabetes_insipida"] },
  { campo: "densidad_urinaria", etiqueta: "Densidad urinaria", unidad: "", min: 1.005, max: 1.03, tipos: ["diabetes_insipida"] },

  // Biomarcadores de cáncer
  { campo: "psa", etiqueta: "PSA total", unidad: "ng/mL", max: 4, severo: 10, tipos: ["marcadores_cancer"] },
  { campo: "ca125", etiqueta: "CA 125", unidad: "U/mL", max: 35, severo: 200, tipos: ["marcadores_cancer"] },
  { campo: "ca19_9", etiqueta: "CA 19-9", unidad: "U/mL", max: 37, severo: 100, tipos: ["marcadores_cancer"] },
  { campo: "cea", etiqueta: "CEA", unidad: "ng/mL", max: 5, severo: 20, tipos: ["marcadores_cancer"] },
  { campo: "afp", etiqueta: "Alfafetoproteína", unidad: "ng/mL", max: 10, severo: 100, tipos: ["marcadores_cancer"] },

  // Testosterona
  { campo: "testosterona_total", etiqueta: "Testosterona total", unidad: "ng/dL", min: 300, max: 1000, severo: 150, severoPorDebajo: true, tipos: ["testosterona"] },
  { campo: "testosterona_libre", etiqueta: "Testosterona libre", unidad: "pg/mL", min: 9, max: 30, tipos: ["testosterona"] },

  // Función renal y presión (transversales)
  { campo: "creatinina", etiqueta: "Creatinina", unidad: "mg/dL", min: 0.5, max: 1.3, severo: 2, tipos: ["general", "diabetes_tipo_1", "diabetes_tipo_2", "diabetes_insipida"] },
];

/** Nivel de un valor frente a su rango de referencia. */
export type LecturaMarcador = "ok" | "warn" | "alert";

/** Compara un valor con su rango y devuelve el semáforo correspondiente. */
export function leerMarcador(def: DefinicionMarcador, valor: number): LecturaMarcador {
  const fueraArriba = def.max != null && valor > def.max;
  const fueraAbajo = def.min != null && valor < def.min;
  if (!fueraArriba && !fueraAbajo) return "ok";

  if (def.severo != null) {
    if (def.severoPorDebajo && valor <= def.severo) return "alert";
    if (!def.severoPorDebajo && valor >= def.severo) return "alert";
  }
  return "warn";
}

/** Texto corto que explica el rango esperado del marcador. */
export function textoRango(def: DefinicionMarcador): string {
  if (def.min != null && def.max != null) return `Referencia ${def.min}–${def.max} ${def.unidad}`.trim();
  if (def.max != null) return `Referencia ≤ ${def.max} ${def.unidad}`.trim();
  if (def.min != null) return `Referencia ≥ ${def.min} ${def.unidad}`.trim();
  return "Sin rango definido";
}
