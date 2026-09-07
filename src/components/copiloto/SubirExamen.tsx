/**
 * FRONTEND · Formulario para registrar un examen real
 * ---------------------------------------------------
 * Recoge los valores del laboratorio y los envía al backend con `crearExamen`.
 * No calcula nada clínico: el nivel de riesgo lo determina el servidor.
 */

import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { crearExamen } from "@/lib/copiloto/examenes.functions";

/** Convierte el texto de un campo numérico en número o `null` si viene vacío. */
function aNumero(texto: string): number | null {
  if (texto.trim() === "") return null;
  const valor = Number(texto.replace(",", "."));
  return Number.isFinite(valor) ? valor : null;
}

export function SubirExamen({
  onGuardado,
  onCerrar,
}: {
  onGuardado: () => void | Promise<void>;
  onCerrar: () => void;
}) {
  const guardar = useServerFn(crearExamen);

  const [titulo, setTitulo] = useState("Panel de control");
  const [laboratorio, setLaboratorio] = useState("");
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [glucemia, setGlucemia] = useState("");
  const [hba1c, setHba1c] = useState("");
  const [sistolica, setSistolica] = useState("");
  const [diastolica, setDiastolica] = useState("");
  const [creatinina, setCreatinina] = useState("");
  const [notas, setNotas] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setError(null);

    const sistolicaNum = aNumero(sistolica);
    const diastolicaNum = aNumero(diastolica);
    if ((sistolicaNum == null) !== (diastolicaNum == null)) {
      setError("Escriba los dos valores de la presión arterial o ninguno.");
      return;
    }
    if (!glucemia && !hba1c && sistolicaNum == null && !creatinina) {
      setError("Registre al menos un resultado del examen.");
      return;
    }

    setEnviando(true);
    try {
      await guardar({
        data: {
          titulo,
          laboratorio,
          fecha,
          glucemiaAyunas: aNumero(glucemia),
          hba1c: aNumero(hba1c),
          presionSistolica: sistolicaNum == null ? null : Math.round(sistolicaNum),
          presionDiastolica: diastolicaNum == null ? null : Math.round(diastolicaNum),
          creatinina: aNumero(creatinina),
          notas,
        },
      });
      await onGuardado();
      onCerrar();
    } catch {
      setError("No se pudo guardar el examen. Revise los valores e intente de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form
      onSubmit={enviar}
      className="mb-6 rounded-[min(2vw,18px)] bg-white/[0.05] p-5 ring-1 ring-white/10 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="font-display text-[11px] font-semibold tracking-[0.12em] uppercase text-ink-dim">
          Nuevo examen
        </p>
        <button
          type="button"
          onClick={onCerrar}
          className="font-body text-sm text-ink-dim hover:text-ink"
        >
          Cancelar
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CampoTexto etiqueta="Nombre del examen" valor={titulo} onChange={setTitulo} requerido />
        <CampoTexto etiqueta="Laboratorio" valor={laboratorio} onChange={setLaboratorio} />
        <CampoTexto etiqueta="Fecha" valor={fecha} onChange={setFecha} tipo="date" requerido />

        <CampoTexto
          etiqueta="Glucemia ayunas (mg/dL)"
          valor={glucemia}
          onChange={setGlucemia}
          marcador="108"
        />
        <CampoTexto etiqueta="HbA1c (%)" valor={hba1c} onChange={setHba1c} marcador="7.8" />
        <CampoTexto
          etiqueta="Creatinina (mg/dL)"
          valor={creatinina}
          onChange={setCreatinina}
          marcador="0.9"
        />

        <CampoTexto
          etiqueta="Presión sistólica"
          valor={sistolica}
          onChange={setSistolica}
          marcador="142"
        />
        <CampoTexto
          etiqueta="Presión diastólica"
          valor={diastolica}
          onChange={setDiastolica}
          marcador="88"
        />
        <CampoTexto etiqueta="Notas" valor={notas} onChange={setNotas} />
      </div>

      {error && <p className="mt-4 font-body text-sm text-alert">{error}</p>}

      <button
        type="submit"
        disabled={enviando}
        className="mt-5 rounded-[min(1vw,8px)] bg-accent-teal/20 px-4 py-2 font-display text-sm font-semibold text-accent-teal ring-1 ring-accent-teal/30 transition-colors hover:bg-accent-teal/30 disabled:opacity-50"
      >
        {enviando ? "Guardando…" : "Guardar examen"}
      </button>
    </form>
  );
}

/** Campo de texto del formulario, con la tipografía del sistema de diseño. */
function CampoTexto({
  etiqueta,
  valor,
  onChange,
  tipo = "text",
  marcador,
  requerido,
}: {
  etiqueta: string;
  valor: string;
  onChange: (v: string) => void;
  tipo?: string;
  marcador?: string;
  requerido?: boolean;
}) {
  return (
    <label className="block">
      <span className="font-display text-[10px] font-semibold tracking-[0.1em] uppercase text-ink-dim">
        {etiqueta}
      </span>
      <input
        type={tipo}
        value={valor}
        placeholder={marcador}
        required={requerido}
        inputMode={marcador ? "decimal" : undefined}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-[min(1vw,8px)] bg-white/[0.04] px-3 py-2 font-body text-sm text-ink ring-1 ring-white/10 outline-none placeholder:text-ink-dim focus:ring-accent-teal/40"
      />
    </label>
  );
}
