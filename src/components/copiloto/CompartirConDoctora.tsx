/** FRONTEND · Gestión del acceso médico desde el panel del paciente. */

import { useServerFn } from "@tanstack/react-start";
import { MailPlus, ShieldCheck, UserRoundCheck, X } from "lucide-react";
import { useEffect, useState } from "react";

import {
  invitarDoctora,
  listarMisInvitaciones,
  revocarInvitacion,
  type InvitacionMedica,
} from "@/lib/copiloto/accesos.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CompartirConDoctora() {
  const listar = useServerFn(listarMisInvitaciones);
  const invitar = useServerFn(invitarDoctora);
  const revocar = useServerFn(revocarInvitacion);
  const [invitaciones, setInvitaciones] = useState<InvitacionMedica[]>([]);
  const [correo, setCorreo] = useState("");
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    void listar()
      .then(setInvitaciones)
      .catch(() => setMensaje("No pudimos cargar sus invitaciones."))
      .finally(() => setCargando(false));
  }, [listar]);

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setCargando(true);
    setMensaje(null);
    try {
      const resultado = await invitar({ data: { correo } });
      setInvitaciones((actuales) => [resultado.invitacion, ...actuales]);
      setCorreo("");
      setMensaje("Invitación creada. El acceso se activará cuando la doctora entre con ese correo.");
    } catch (error) {
      setMensaje(error instanceof Error ? error.message : "No se pudo crear la invitación.");
    } finally {
      setCargando(false);
    }
  }

  async function quitar(id: string) {
    setCargando(true);
    setMensaje(null);
    try {
      await revocar({ data: { id } });
      setInvitaciones((actuales) => actuales.filter((invitacion) => invitacion.id !== id));
      setMensaje("El acceso fue revocado.");
    } catch (error) {
      setMensaje(error instanceof Error ? error.message : "No se pudo revocar el acceso.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <section className="rounded-lg border border-clinical-border bg-panel p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-lime/15 text-brand-lime">
          <ShieldCheck aria-hidden="true" />
        </div>
        <div>
          <p className="font-body text-xs font-semibold uppercase text-brand-blue">Acceso clínico</p>
          <h2 className="mt-1 font-display text-lg font-bold text-ink">Compartir con mi doctora</h2>
          <p className="mt-1 font-body text-sm leading-relaxed text-ink-dim">
            Podrá consultar sus exámenes y el riesgo, pero no modificar ni eliminar información.
          </p>
        </div>
      </div>

      <form onSubmit={enviar} className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <Label htmlFor="correo-doctora" className="font-body text-xs font-semibold text-ink-dim">
            Correo de la doctora
          </Label>
          <Input
            id="correo-doctora"
            type="email"
            required
            autoComplete="email"
            value={correo}
            onChange={(evento) => setCorreo(evento.target.value)}
            placeholder="doctora@clinica.com"
            className="mt-1.5 bg-panel"
          />
        </div>
        <Button type="submit" disabled={cargando}>
          <MailPlus aria-hidden="true" />
          Invitar
        </Button>
      </form>

      {mensaje && <p role="status" className="mt-3 font-body text-xs leading-relaxed text-ink-dim">{mensaje}</p>}

      {invitaciones.length > 0 && (
        <ul className="mt-5 divide-y divide-clinical-border border-t border-clinical-border">
          {invitaciones.map((invitacion) => (
            <li key={invitacion.id} className="flex items-center justify-between gap-3 py-3">
              <div className="flex min-w-0 items-center gap-2">
                <UserRoundCheck className="size-4 shrink-0 text-brand-blue" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="truncate font-body text-sm font-semibold text-ink">{invitacion.correo}</p>
                  <p className="font-body text-xs text-ink-dim">
                    {invitacion.estado === "activo" ? "Acceso activo" : "Invitación pendiente"}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={cargando}
                onClick={() => void quitar(invitacion.id)}
                title="Revocar acceso"
                aria-label={`Revocar acceso de ${invitacion.correo}`}
              >
                <X aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}