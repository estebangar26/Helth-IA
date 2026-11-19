import { useState, type FormEvent } from "react";
import { Mail, MessageCircle, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { contactoSchema, tiposContacto, type ContactoDatos } from "@/lib/contacto/esquema";

const inicial: ContactoDatos = {
  nombre: "",
  email: "",
  tipo: "opinion",
  mensaje: "",
  website: "",
};

/** FRONTEND · Contacto directo y PQRS; el envío real ocurre en la ruta pública del servidor. */
export function ContactoPqrs() {
  const [datos, setDatos] = useState<ContactoDatos>(inicial);
  const [error, setError] = useState("");
  const [resultado, setResultado] = useState<{ id: string; avisoEnviado: boolean } | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError("");
    setResultado(null);

    const valido = contactoSchema.safeParse(datos);
    if (!valido.success) {
      setError(valido.error.issues[0]?.message ?? "Revisa los datos del formulario.");
      return;
    }

    setEnviando(true);
    try {
      const respuesta = await fetch("/api/public/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(valido.data),
      });
      const cuerpo = await respuesta.json() as { id?: string; avisoEnviado?: boolean; error?: string };
      if (!respuesta.ok || !cuerpo.id) throw new Error(cuerpo.error || "No pudimos registrar tu mensaje. Inténtalo de nuevo.");

      setResultado({ id: cuerpo.id, avisoEnviado: cuerpo.avisoEnviado === true });
      setDatos(inicial);
    } catch (falla) {
      setError(falla instanceof Error ? falla.message : "No pudimos registrar tu mensaje. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-[1200px] gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:px-8">
      <div>
        <div className="flex items-center gap-3 text-primary"><Mail aria-hidden="true" /><span className="font-body text-xs font-bold uppercase">Hablemos</span></div>
        <h2 id="contacto-titulo" className="mt-4 font-display text-3xl font-bold text-ink">Contacto y PQRS</h2>
        <p className="mt-4 font-body text-sm leading-6 text-ink-dim">
          Déjame tu opinión, petición, queja, reclamo o sugerencia sobre HelthIA. Recibiré tu mensaje directamente y quedará un radicado para identificarlo.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
          <Button asChild variant="outline" className="justify-start">
            <a href="mailto:estebangarcia2604@gmail.com"><Mail className="size-4" aria-hidden="true" />estebangarcia2604@gmail.com</a>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <a href="https://wa.me/573215875932" target="_blank" rel="noreferrer"><MessageCircle className="size-4" aria-hidden="true" />+57 321 587 5932</a>
          </Button>
        </div>
      </div>

      <form onSubmit={enviar} className="rounded-lg border border-clinical-border bg-panel p-5 sm:p-6" noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contacto-nombre">Nombre</Label>
            <Input id="contacto-nombre" name="nombre" autoComplete="name" maxLength={100} required value={datos.nombre} onChange={(e) => setDatos({ ...datos, nombre: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contacto-email">Tu correo</Label>
            <Input id="contacto-email" name="email" type="email" autoComplete="email" maxLength={254} required value={datos.email} onChange={(e) => setDatos({ ...datos, email: e.target.value })} />
          </div>
        </div>
        <div className="mt-5 space-y-2">
          <Label htmlFor="contacto-tipo">Tipo de mensaje</Label>
          <select id="contacto-tipo" name="tipo" value={datos.tipo} onChange={(e) => setDatos({ ...datos, tipo: e.target.value as ContactoDatos["tipo"] })} className="flex h-9 w-full rounded-md border border-input bg-panel px-3 py-1 font-body text-sm text-ink shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
            {tiposContacto.map((tipo) => <option key={tipo.valor} value={tipo.valor}>{tipo.etiqueta}</option>)}
          </select>
        </div>
        <div className="mt-5 space-y-2">
          <Label htmlFor="contacto-mensaje">Mensaje</Label>
          <Textarea id="contacto-mensaje" name="mensaje" rows={6} minLength={10} maxLength={2000} required placeholder="Escribe aquí tu opinión o solicitud" value={datos.mensaje} onChange={(e) => setDatos({ ...datos, mensaje: e.target.value })} />
          <p className="text-right font-body text-xs text-ink-dim">{datos.mensaje.length}/2000</p>
        </div>
        <div className="absolute left-[-10000px] top-auto size-px overflow-hidden" aria-hidden="true">
          <Label htmlFor="contacto-website">No completar</Label>
          <Input id="contacto-website" name="website" tabIndex={-1} autoComplete="off" value={datos.website} onChange={(e) => setDatos({ ...datos, website: e.target.value })} />
        </div>
        {error && <p role="alert" className="mt-4 font-body text-sm text-destructive">{error}</p>}
        {resultado && (
          <div role="status" className="mt-4 rounded-md border border-clinical-border bg-panel-soft p-4 font-body text-sm leading-6 text-ink">
            <p className="font-semibold">Mensaje registrado. Radicado: {resultado.id.slice(0, 8).toUpperCase()}.</p>
            <p className="mt-1 text-ink-dim">{resultado.avisoEnviado ? "El aviso llegó al correo de Esteban." : "El mensaje quedó guardado, pero el aviso por correo no pudo enviarse. También puedes escribir por WhatsApp."}</p>
          </div>
        )}
        <Button type="submit" className="mt-5 w-full sm:w-auto" disabled={enviando}>
          <Send className="size-4" aria-hidden="true" />{enviando ? "Enviando…" : "Enviar mensaje"}
        </Button>
      </form>
    </div>
  );
}
