/**
 * BACKEND · LECTURA AUTOMÁTICA DE UN EXAMEN (PDF O IMAGEN)
 * -------------------------------------------------------
 * Módulo de servidor (sufijo `.server`, nunca llega al navegador).
 * Envía el archivo del laboratorio al modelo multimodal de Lovable AI y
 * devuelve los valores clínicos ya estructurados. No guarda nada: de eso se
 * encarga la función de servidor que lo invoca.
 */

import { MARCADORES, type TipoExamen } from "./marcadores";

/** Valores que el modelo debe extraer del documento del laboratorio. */
export interface ExtraccionExamen {
  titulo: string | null;
  laboratorio: string | null;
  fecha: string | null; // AAAA-MM-DD
  validadoEn: string | null; // fecha y hora ISO de validación del laboratorio
  tipoExamen: TipoExamen;
  notas: string | null;
  /** Valores numéricos por nombre de columna (glucemia_ayunas, psa, etc.). */
  valores: Record<string, number | null>;
}

/** Tipos de examen válidos para la categoría que devuelve el modelo. */
const TIPOS: TipoExamen[] = [
  "diabetes_tipo_1",
  "diabetes_tipo_2",
  "diabetes_insipida",
  "marcadores_cancer",
  "testosterona",
  "general",
];

/** Columnas numéricas que el modelo puede reportar. */
const CAMPOS_NUMERICOS = [
  ...MARCADORES.map((m) => m.campo),
  "presion_sistolica",
  "presion_diastolica",
];

/** Lista de marcadores con su unidad, para que el modelo no confunda escalas. */
const LISTA_UNIDADES = MARCADORES.map((m) => `- ${m.campo} (${m.etiqueta}) en ${m.unidad || "sin unidad"}`).join("\n");

const INSTRUCCION = `Eres un asistente clínico que lee documentos de laboratorio en español.
Extrae únicamente los datos que aparezcan explícitamente en el documento.
Responde SOLO con un objeto JSON válido, sin texto adicional ni bloques de código, con estas claves:
{"titulo":string|null,"laboratorio":string|null,"fecha":"AAAA-MM-DD"|null,"validadoEn":"AAAA-MM-DDTHH:MM:00-05:00"|null,"tipoExamen":"diabetes_tipo_1"|"diabetes_tipo_2"|"diabetes_insipida"|"marcadores_cancer"|"testosterona"|"general","notas":string|null,"valores":{}}
"validadoEn" es la fecha y hora en que el laboratorio validó o firmó los resultados (hora de Colombia), solo si aparece escrita.
En "valores" incluye solo las claves que encuentres, usando exactamente estos nombres y unidades:
${LISTA_UNIDADES}
- presion_sistolica y presion_diastolica en mmHg
Reglas:
- Si un dato no aparece, omítelo o usa null. Nunca inventes valores.
- Convierte al sistema de unidades indicado cuando el informe use otro.
- "tipoExamen" describe el enfoque principal del informe.
- "notas" es un resumen muy breve (máx. 200 caracteres) de otros hallazgos relevantes.`;

/** Quita cercos de código y deja solo el objeto JSON. */
function extraerJson(texto: string): unknown {
  const limpio = texto.replace(/```json/gi, "").replace(/```/g, "").trim();
  const inicio = limpio.indexOf("{");
  const fin = limpio.lastIndexOf("}");
  if (inicio === -1 || fin === -1) throw new Error("Respuesta sin JSON.");
  return JSON.parse(limpio.slice(inicio, fin + 1));
}

/** Normaliza un número que el modelo pudo devolver como texto. */
function aNumero(valor: unknown): number | null {
  if (valor == null || valor === "") return null;
  const n = typeof valor === "number" ? valor : Number(String(valor).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

/** Normaliza un texto corto. */
function aTexto(valor: unknown, max: number): string | null {
  if (typeof valor !== "string") return null;
  const limpio = valor.trim();
  return limpio ? limpio.slice(0, max) : null;
}

/**
 * Analiza el archivo (PDF o imagen) y devuelve los valores encontrados.
 * @param base64 contenido del archivo en base64 (sin prefijo `data:`)
 * @param mime tipo real del archivo, p. ej. `application/pdf` o `image/jpeg`
 * @param nombreArchivo nombre original, útil como respaldo del título
 */
export async function analizarArchivoExamen(
  base64: string,
  mime: string,
  nombreArchivo: string,
): Promise<ExtraccionExamen> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("El servicio de análisis no está configurado.");

  const bloqueArchivo = mime === "application/pdf"
    ? {
        type: "file" as const,
        file: { filename: nombreArchivo, file_data: `data:${mime};base64,${base64}` },
      }
    : {
        type: "image_url" as const,
        image_url: { url: `data:${mime};base64,${base64}` },
      };

  const respuesta = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3.8-flash",
      messages: [
        {
          role: "user",
          content: [{ type: "text", text: INSTRUCCION }, bloqueArchivo],
        },
      ],
    }),
  });

  if (!respuesta.ok) {
    const detalle = await respuesta.text();
    if (respuesta.status === 429) throw new Error("Hay muchas solicitudes en este momento. Intente de nuevo en unos segundos.");
    if (respuesta.status === 402) throw new Error("Los créditos de análisis del proyecto se agotaron. El dueño de la aplicación debe recargarlos.");
    if (respuesta.status === 403) throw new Error("El análisis automático está bloqueado por la configuración del espacio de trabajo.");
    throw new Error(`No se pudo analizar el archivo (${respuesta.status}): ${detalle.slice(0, 200)}`);
  }

  const cuerpo = (await respuesta.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const contenido = cuerpo.choices?.[0]?.message?.content ?? "";
  const crudo = extraerJson(contenido) as Record<string, unknown>;

  const fecha = aTexto(crudo["fecha"], 10);
  const tipo = aTexto(crudo["tipoExamen"], 40) as TipoExamen | null;
  const crudoValores = (crudo["valores"] ?? {}) as Record<string, unknown>;

  const valores: Record<string, number | null> = {};
  for (const campo of CAMPOS_NUMERICOS) {
    // El modelo puede devolver el valor dentro de "valores" o en la raíz.
    const encontrado = crudoValores[campo] ?? crudo[campo];
    valores[campo] = aNumero(encontrado);
  }

  // La presión solo tiene sentido como par completo.
  if (valores["presion_sistolica"] == null || valores["presion_diastolica"] == null) {
    valores["presion_sistolica"] = null;
    valores["presion_diastolica"] = null;
  } else {
    valores["presion_sistolica"] = Math.round(valores["presion_sistolica"]);
    valores["presion_diastolica"] = Math.round(valores["presion_diastolica"]);
  }

  return {
    titulo: aTexto(crudo["titulo"], 120) ?? nombreArchivo.replace(/\.[^.]+$/, "").slice(0, 120),
    laboratorio: aTexto(crudo["laboratorio"], 120),
    fecha: fecha && /^\d{4}-\d{2}-\d{2}$/.test(fecha) ? fecha : null,
    validadoEn: (() => {
      const v = aTexto(crudo["validadoEn"], 25);
      return v && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(v) && !isNaN(Date.parse(v)) ? v : null;
    })(),
    tipoExamen: tipo && TIPOS.includes(tipo) ? tipo : "general",
    notas: aTexto(crudo["notas"], 400),
    valores,
  };
}
