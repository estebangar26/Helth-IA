/**
 * FRONTEND · Carga de un examen como archivo (PDF o imagen)
 * --------------------------------------------------------
 * El paciente solo elige el archivo del laboratorio: no escribe ningún valor.
 * El archivo se envía al backend, que lo analiza y guarda los resultados.
 */

import { useServerFn } from "@tanstack/react-start";
import { FileText, Loader2, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";

import { analizarYGuardarExamen } from "@/lib/copiloto/examenes.functions";
import { Button } from "@/components/ui/button";

/** Tipos de archivo que el análisis acepta. */
const TIPOS_ACEPTADOS = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const TAMANO_MAXIMO = 10 * 1024 * 1024; // 10 MB

/** Convierte el archivo elegido en base64 sin el prefijo `data:`. */
function aBase64(archivo: File): Promise<string> {
  return new Promise((resolver, rechazar) => {
    const lector = new FileReader();
    lector.onerror = () => rechazar(new Error("No se pudo leer el archivo."));
    lector.onload = () => {
      const resultado = String(lector.result);
      resolver(resultado.slice(resultado.indexOf(",") + 1));
    };
    lector.readAsDataURL(archivo);
  });
}

export function SubirExamen({
  onGuardado,
  onCerrar,
}: {
  onGuardado: () => void | Promise<void>;
  onCerrar: () => void;
}) {
  const analizar = useServerFn(analizarYGuardarExamen);
  const entradaArchivo = useRef<HTMLInputElement>(null);

  const [arrastrando, setArrastrando] = useState(false);
  const [nombre, setNombre] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);

  /** Valida, analiza y guarda el archivo elegido. */
  async function procesar(archivo: File) {
    setError(null);

    if (!TIPOS_ACEPTADOS.includes(archivo.type)) {
      setError("Solo aceptamos archivos PDF, JPG, PNG o WEBP.");
      return;
    }
    if (archivo.size > TAMANO_MAXIMO) {
      setError("El archivo supera los 10 MB. Suba una versión más liviana.");
      return;
    }

    setNombre(archivo.name);
    setProcesando(true);
    try {
      const contenido = await aBase64(archivo);
      await analizar({
        data: {
          nombre: archivo.name,
          mime: archivo.type as (typeof TIPOS_ACEPTADOS)[number],
          contenido,
        },
      });
      await onGuardado();
      onCerrar();
    } catch (fallo) {
      setError(
        fallo instanceof Error && fallo.message
          ? fallo.message
          : "No pudimos leer el examen. Intente con otro archivo.",
      );
    } finally {
      setProcesando(false);
    }
  }

  return (
    <section className="mb-6 rounded-lg border border-clinical-border bg-panel p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-body text-xs font-semibold uppercase text-brand-blue">Nuevo registro</p>
          <h2 className="mt-1 font-display text-lg font-bold text-ink">
            Suba el examen de su laboratorio
          </h2>
          <p className="mt-1 font-body text-sm text-ink-dim">
            Adjunte el PDF o la foto del resultado. Leemos los valores por usted; no tiene que
            escribir nada. Reconocemos exámenes de diabetes tipo 1 y tipo 2, diabetes insípida,
            biomarcadores de cáncer y testosterona. Si un valor sale del rango esperado, avisamos a
            su médico tratante.
          </p>
        </div>
        <Button type="button" onClick={onCerrar} variant="ghost">
          Cancelar
        </Button>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setArrastrando(true);
        }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={(e) => {
          e.preventDefault();
          setArrastrando(false);
          const archivo = e.dataTransfer.files?.[0];
          if (archivo && !procesando) void procesar(archivo);
        }}
        className={`mt-5 rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          arrastrando ? "border-brand-blue bg-panel-soft" : "border-clinical-border bg-panel-soft"
        }`}
      >
        {procesando ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 aria-hidden="true" className="size-8 animate-spin text-brand-blue" />
            <p className="font-body text-sm font-semibold text-ink">Analizando su examen…</p>
            <p className="font-body text-xs text-ink-dim">{nombre}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <UploadCloud aria-hidden="true" className="size-8 text-brand-blue" />
            <p className="font-body text-sm text-ink-dim">
              Arrastre aquí su archivo o elíjalo desde su dispositivo
            </p>
            <Button type="button" onClick={() => entradaArchivo.current?.click()}>
              <FileText aria-hidden="true" />
              Elegir archivo
            </Button>
            <p className="font-body text-xs text-ink-dim">PDF, JPG, PNG o WEBP · hasta 10 MB</p>
          </div>
        )}

        <input
          ref={entradaArchivo}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const archivo = e.target.files?.[0];
            e.target.value = "";
            if (archivo) void procesar(archivo);
          }}
        />
      </div>

      {error && (
        <p role="alert" className="mt-4 font-body text-sm text-alert">
          {error}
        </p>
      )}

      <p className="mt-4 font-body text-xs leading-relaxed text-ink-dim">
        La lectura automática puede equivocarse. Revise los valores mostrados y confírmelos con su
        equipo de salud.
      </p>
    </section>
  );
}
