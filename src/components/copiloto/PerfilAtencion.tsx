import { useServerFn } from "@tanstack/react-start";
import { Save, UserRound } from "lucide-react";
import { useState } from "react";
import { useRouter } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { guardarPerfil } from "@/lib/copiloto/examenes.functions";
import type { Paciente } from "@/lib/copiloto/tipos";

export function PerfilAtencion({ paciente }: { paciente: Paciente }) {
  const guardar = useServerFn(guardarPerfil);
  const router = useRouter();
  const [nombre, setNombre] = useState(paciente.nombre);
  const [edad, setEdad] = useState(paciente.edad ? String(paciente.edad) : "");
  const [tipo, setTipo] = useState<"eps" | "privado">(paciente.tipoAtencion);
  const [documento, setDocumento] = useState(paciente.documento === "Sin documento registrado" ? "" : paciente.documento);
  const [eps, setEps] = useState(paciente.epsNombre ?? "");
  const [familia, setFamilia] = useState(paciente.medicoFamilia ?? "");
  const [tratante, setTratante] = useState(paciente.medicoTratante ?? "");
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setCargando(true);
    setMensaje(null);
    try {
      await guardar({ data: { nombre, edad: edad ? Number(edad) : null, documento, tipoAtencion: tipo, epsNombre: eps, medicoFamilia: familia, medicoTratante: tratante } });
      setMensaje("Perfil guardado y documento validado. Ya puede subir exámenes.");
      await router.invalidate();
    } catch (error) {
      setMensaje(error instanceof Error ? error.message : "No se pudo guardar la información.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <section className="rounded-lg border border-clinical-border bg-panel p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-3"><UserRound className="text-brand-blue" aria-hidden="true" /><div><p className="font-body text-xs font-semibold uppercase text-brand-blue">Mi perfil</p><h2 className="font-display text-lg font-bold text-ink">Tipo de atención</h2></div></div>
      <form onSubmit={enviar} className="mt-5 space-y-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_120px]"><Campo etiqueta="Nombre completo (obligatorio)" valor={nombre} onChange={setNombre} /><Campo etiqueta="Edad (opcional)" valor={edad} onChange={(v) => setEdad(v.replace(/\D/g, "").slice(0, 3))} /></div>
        <Campo etiqueta="Documento de identidad (obligatorio)" valor={documento} onChange={setDocumento} />
        <div><p className="font-body text-xs font-semibold text-ink-dim">¿Cómo recibe su atención médica? (obligatorio)</p><p className="mt-1 font-body text-xs text-ink-dim">Elija EPS si lo atiende su entidad de salud con un médico de familia, o Privado si consulta por su cuenta con un médico particular. Con Privado podrá ver el directorio de especialistas.</p></div>
        <RadioGroup value={tipo} onValueChange={(valor) => setTipo(valor as "eps" | "privado")}>
          <Label className="flex items-center gap-2 font-body text-sm text-ink"><RadioGroupItem value="eps" /> EPS (médico de familia)</Label>
          <Label className="flex items-center gap-2 font-body text-sm text-ink"><RadioGroupItem value="privado" /> Privado</Label>
        </RadioGroup>
        {tipo === "eps" ? <div className="grid gap-3 sm:grid-cols-2"><Campo etiqueta="Nombre de la EPS (opcional)" valor={eps} onChange={setEps} /><Campo etiqueta="Médico de familia (opcional)" valor={familia} onChange={setFamilia} /></div> : <Campo etiqueta="Médico tratante (opcional)" valor={tratante} onChange={setTratante} />}
        {mensaje && <p role="status" className="font-body text-xs text-ink-dim">{mensaje}</p>}
        <Button type="submit" disabled={cargando}><Save aria-hidden="true" />{cargando ? "Guardando…" : "Guardar"}</Button>
      </form>
    </section>
  );
}

function Campo({ etiqueta, valor, onChange }: { etiqueta: string; valor: string; onChange: (valor: string) => void }) {
  return <div><Label className="font-body text-xs font-semibold text-ink-dim">{etiqueta}</Label><Input value={valor} onChange={(evento) => onChange(evento.target.value)} className="mt-1.5 bg-panel" /></div>;
}
