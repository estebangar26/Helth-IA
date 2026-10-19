/**
 * CATÁLOGO DE VARIABLES DE LABORATORIO (solo para la pestaña Resultados)
 * ---------------------------------------------------------------------
 * Define las categorías y los analitos que la aplicación sabe reconocer.
 * Contiene ÚNICAMENTE metadatos (código, nombre, unidad habitual): nunca
 * resultados de pacientes ni rangos clínicos inventados. El rango de
 * referencia se muestra solo cuando el laboratorio lo reporta en el documento.
 */

export type CategoriaResultado =
  | "hemograma"
  | "renal"
  | "hepatica"
  | "lipidos"
  | "electrolitos"
  | "tiroides"
  | "hormonal"
  | "tumoral"
  | "glucosa";

export const ETIQUETA_CATEGORIA: Record<CategoriaResultado, string> = {
  hemograma: "Hemograma completo",
  renal: "Función renal",
  hepatica: "Función hepática",
  lipidos: "Perfil lipídico",
  electrolitos: "Electrolitos y minerales",
  tiroides: "Función tiroidea",
  hormonal: "Evaluación hormonal",
  tumoral: "Marcadores tumorales",
  glucosa: "Metabolismo de la glucosa",
};

export const ORDEN_CATEGORIAS: CategoriaResultado[] = [
  "glucosa",
  "hemograma",
  "renal",
  "hepatica",
  "lipidos",
  "electrolitos",
  "tiroides",
  "hormonal",
  "tumoral",
];

export interface AnalitoCatalogo {
  codigo: string;
  nombre: string;
  unidad: string;
  categoria: CategoriaResultado;
}

/** Catálogo completo; las variables nuevas se agregan aquí sin tocar la página. */
export const CATALOGO_ANALITOS: AnalitoCatalogo[] = [
  // Metabolismo de la glucosa (conserva las variables de diabetes existentes)
  { codigo: "glucemia_ayunas", nombre: "Glucemia en ayunas", unidad: "mg/dL", categoria: "glucosa" },
  { codigo: "hba1c", nombre: "Hemoglobina glicosilada (HbA1c)", unidad: "%", categoria: "glucosa" },
  { codigo: "insulina", nombre: "Insulina basal", unidad: "µU/mL", categoria: "glucosa" },
  { codigo: "glucemia_posprandial", nombre: "Glucosa posprandial", unidad: "mg/dL", categoria: "glucosa" },
  { codigo: "glucosa_aleatoria", nombre: "Glucosa plasmática aleatoria", unidad: "mg/dL", categoria: "glucosa" },
  { codigo: "glucosa_sobrecarga_2h", nombre: "Glucosa a las 2 h de sobrecarga oral", unidad: "mg/dL", categoria: "glucosa" },
  { codigo: "peptido_c", nombre: "Péptido C", unidad: "ng/mL", categoria: "glucosa" },
  { codigo: "fructosamina", nombre: "Fructosamina", unidad: "µmol/L", categoria: "glucosa" },

  // Hemograma completo
  { codigo: "hemoglobina", nombre: "Hemoglobina", unidad: "g/dL", categoria: "hemograma" },
  { codigo: "hematocrito", nombre: "Hematocrito", unidad: "%", categoria: "hemograma" },
  { codigo: "eritrocitos", nombre: "Eritrocitos", unidad: "millones/µL", categoria: "hemograma" },
  { codigo: "leucocitos", nombre: "Leucocitos", unidad: "/µL", categoria: "hemograma" },
  { codigo: "neutrofilos", nombre: "Neutrófilos", unidad: "%", categoria: "hemograma" },
  { codigo: "linfocitos", nombre: "Linfocitos", unidad: "%", categoria: "hemograma" },
  { codigo: "monocitos", nombre: "Monocitos", unidad: "%", categoria: "hemograma" },
  { codigo: "eosinofilos", nombre: "Eosinófilos", unidad: "%", categoria: "hemograma" },
  { codigo: "basofilos", nombre: "Basófilos", unidad: "%", categoria: "hemograma" },
  { codigo: "plaquetas", nombre: "Plaquetas", unidad: "/µL", categoria: "hemograma" },
  { codigo: "vcm", nombre: "Volumen corpuscular medio", unidad: "fL", categoria: "hemograma" },
  { codigo: "hcm", nombre: "Hemoglobina corpuscular media", unidad: "pg", categoria: "hemograma" },
  { codigo: "chcm", nombre: "Conc. media de hemoglobina corpuscular", unidad: "g/dL", categoria: "hemograma" },
  { codigo: "ade", nombre: "Amplitud de distribución eritrocitaria", unidad: "%", categoria: "hemograma" },

  // Función renal
  { codigo: "creatinina", nombre: "Creatinina sérica", unidad: "mg/dL", categoria: "renal" },
  { codigo: "tfg", nombre: "Tasa de filtración glomerular estimada", unidad: "mL/min/1.73 m²", categoria: "renal" },
  { codigo: "urea", nombre: "Urea", unidad: "mg/dL", categoria: "renal" },
  { codigo: "bun", nombre: "Nitrógeno ureico en sangre (BUN)", unidad: "mg/dL", categoria: "renal" },
  { codigo: "albumina_creatinina_orina", nombre: "Relación albúmina/creatinina en orina", unidad: "mg/g", categoria: "renal" },
  { codigo: "acido_urico", nombre: "Ácido úrico", unidad: "mg/dL", categoria: "renal" },
  { codigo: "cistatina_c", nombre: "Cistatina C", unidad: "mg/L", categoria: "renal" },

  // Función hepática
  { codigo: "alt", nombre: "ALT/TGP", unidad: "U/L", categoria: "hepatica" },
  { codigo: "ast", nombre: "AST/TGO", unidad: "U/L", categoria: "hepatica" },
  { codigo: "fosfatasa_alcalina", nombre: "Fosfatasa alcalina", unidad: "U/L", categoria: "hepatica" },
  { codigo: "ggt", nombre: "Gamma-glutamil transferasa (GGT)", unidad: "U/L", categoria: "hepatica" },
  { codigo: "bilirrubina_total", nombre: "Bilirrubina total", unidad: "mg/dL", categoria: "hepatica" },
  { codigo: "bilirrubina_directa", nombre: "Bilirrubina directa", unidad: "mg/dL", categoria: "hepatica" },
  { codigo: "albumina", nombre: "Albúmina", unidad: "g/dL", categoria: "hepatica" },
  { codigo: "proteinas_totales", nombre: "Proteínas totales", unidad: "g/dL", categoria: "hepatica" },

  // Perfil lipídico
  { codigo: "colesterol_total", nombre: "Colesterol total", unidad: "mg/dL", categoria: "lipidos" },
  { codigo: "hdl", nombre: "Colesterol HDL", unidad: "mg/dL", categoria: "lipidos" },
  { codigo: "ldl", nombre: "Colesterol LDL", unidad: "mg/dL", categoria: "lipidos" },
  { codigo: "trigliceridos", nombre: "Triglicéridos", unidad: "mg/dL", categoria: "lipidos" },
  { codigo: "colesterol_no_hdl", nombre: "Colesterol no HDL", unidad: "mg/dL", categoria: "lipidos" },

  // Electrolitos y minerales
  { codigo: "sodio", nombre: "Sodio", unidad: "mEq/L", categoria: "electrolitos" },
  { codigo: "potasio", nombre: "Potasio", unidad: "mEq/L", categoria: "electrolitos" },
  { codigo: "cloruro", nombre: "Cloruro", unidad: "mEq/L", categoria: "electrolitos" },
  { codigo: "bicarbonato", nombre: "Bicarbonato", unidad: "mEq/L", categoria: "electrolitos" },
  { codigo: "calcio", nombre: "Calcio total", unidad: "mg/dL", categoria: "electrolitos" },
  { codigo: "magnesio", nombre: "Magnesio", unidad: "mg/dL", categoria: "electrolitos" },
  { codigo: "fosforo", nombre: "Fósforo", unidad: "mg/dL", categoria: "electrolitos" },

  // Función tiroidea
  { codigo: "tsh", nombre: "TSH", unidad: "µUI/mL", categoria: "tiroides" },
  { codigo: "t4_libre", nombre: "T4 libre", unidad: "ng/dL", categoria: "tiroides" },
  { codigo: "t3_libre", nombre: "T3 libre", unidad: "pg/mL", categoria: "tiroides" },

  // Evaluación hormonal (conserva la testosterona existente)
  { codigo: "testosterona_total", nombre: "Testosterona total", unidad: "ng/dL", categoria: "hormonal" },
  { codigo: "testosterona_libre", nombre: "Testosterona libre", unidad: "pg/mL", categoria: "hormonal" },
  { codigo: "shbg", nombre: "SHBG", unidad: "nmol/L", categoria: "hormonal" },
  { codigo: "lh", nombre: "LH", unidad: "UI/L", categoria: "hormonal" },
  { codigo: "fsh", nombre: "FSH", unidad: "UI/L", categoria: "hormonal" },
  { codigo: "estradiol", nombre: "Estradiol", unidad: "pg/mL", categoria: "hormonal" },
  { codigo: "prolactina", nombre: "Prolactina", unidad: "ng/mL", categoria: "hormonal" },

  // Marcadores tumorales (conserva los existentes)
  { codigo: "psa", nombre: "PSA total", unidad: "ng/mL", categoria: "tumoral" },
  { codigo: "psa_libre", nombre: "PSA libre", unidad: "ng/mL", categoria: "tumoral" },
  { codigo: "ca125", nombre: "CA 125", unidad: "U/mL", categoria: "tumoral" },
  { codigo: "ca15_3", nombre: "CA 15-3", unidad: "U/mL", categoria: "tumoral" },
  { codigo: "ca19_9", nombre: "CA 19-9", unidad: "U/mL", categoria: "tumoral" },
  { codigo: "ca27_29", nombre: "CA 27.29", unidad: "U/mL", categoria: "tumoral" },
  { codigo: "cea", nombre: "CEA", unidad: "ng/mL", categoria: "tumoral" },
  { codigo: "afp", nombre: "Alfafetoproteína", unidad: "ng/mL", categoria: "tumoral" },
  { codigo: "he4", nombre: "HE4", unidad: "pmol/L", categoria: "tumoral" },
  { codigo: "beta_hcg", nombre: "Beta-hCG", unidad: "mUI/mL", categoria: "tumoral" },
  { codigo: "ldh", nombre: "LDH", unidad: "U/L", categoria: "tumoral" },
  { codigo: "cromogranina_a", nombre: "Cromogranina A", unidad: "ng/mL", categoria: "tumoral" },
];

/** Mapa rápido código → definición, para validar lo que extrae el modelo. */
export const ANALITO_POR_CODIGO: Record<string, AnalitoCatalogo> = Object.fromEntries(
  CATALOGO_ANALITOS.map((a) => [a.codigo, a]),
);

/** Lista compacta para el prompt de extracción (código, nombre, unidad). */
export const LISTA_CATALOGO_PROMPT = CATALOGO_ANALITOS.map(
  (a) => `- ${a.codigo}: ${a.nombre} (${a.unidad})`,
).join("\n");
