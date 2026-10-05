import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2 } from "lucide-react";

import { borrarEspecialista, crearEspecialista, obtenerResumenAdmin } from "@/lib/copiloto/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { Fondo } from "@/components/copiloto/Fondo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/admin")({
  loader: () => obtenerResumenAdmin(),
  head: () => ({ meta: [
    { title: "Administración · HelthIA" },
    { name: "description", content: "Panel administrativo de HelthIA: usuarios, alertas y especialistas." },
    { property: "og:title", content: "Administración · HelthIA" },
    { property: "og:description", content: "Gestión interna de la plataforma HelthIA." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  errorComponent: ({ error }) => <p role="alert" className="p-10 text-center font-body text-ink-dim">{error.message}</p>,
  component: Admin,
});

const CAMPOS = [["nombre", "Nombre"], ["especialidad", "Especialidad"], ["enfermedad_que_atiende", "Enfermedad"], ["ciudad", "Ciudad"], ["contacto", "Contacto"]] as const;
const vacio = { nombre: "", especialidad: "", enfermedad_que_atiende: "", ciudad: "", contacto: "" };

function Admin() {
  const d = Route.useLoaderData();
  const router = useRouter();
  const [form, setForm] = useState(vacio);
  const [msg, setMsg] = useState<string | null>(null);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    try { await crearEspecialista({ data: form }); setForm(vacio); setMsg("Especialista agregado."); router.invalidate(); }
    catch (err) { setMsg(err instanceof Error ? err.message : "Error"); }
  }

  const caja = "rounded-lg border border-clinical-border bg-panel p-5";
  return (
    <>
      <Fondo />
      <div className="mx-auto max-w-[1100px] space-y-6 px-4 py-8">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-semibold text-ink">Administración</h1>
          <Button variant="outline" onClick={async () => { await supabase.auth.signOut(); router.navigate({ to: "/auth", search: { redirect: undefined } }); }}>Salir</Button>
        </div>
        <section className={caja}>
          <h2 className="mb-3 font-display text-lg text-ink">Usuarios ({d.usuarios.length})</h2>
          <ul className="divide-y divide-clinical-border font-body text-sm">
            {d.usuarios.map((u) => <li key={u.id} className="flex justify-between py-2 text-ink"><span>{u.nombre}</span><span className="text-ink-dim">{u.rol} · {u.tipo}</span></li>)}
          </ul>
        </section>
        <section className={caja}>
          <h2 className="mb-3 font-display text-lg text-ink">Alertas recientes</h2>
          {d.alertas.length === 0 ? <p className="font-body text-sm text-ink-dim">Sin alertas.</p> : (
            <ul className="space-y-1 font-body text-sm">{d.alertas.map((a) => <li key={a.id} className="text-ink">{a.titular} <span className="text-ink-dim">· {a.nivel} · {a.estado_envio}</span></li>)}</ul>
          )}
        </section>
        <section className={caja}>
          <h2 className="mb-3 font-display text-lg text-ink">Especialistas</h2>
          <form onSubmit={crear} className="mb-4 grid gap-2 sm:grid-cols-6">
            {CAMPOS.map(([k, l]) => <Input key={k} placeholder={l} required value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />)}
            <Button type="submit">Agregar</Button>
          </form>
          {msg && <p className="mb-2 font-body text-sm text-ink-dim">{msg}</p>}
          <ul className="divide-y divide-clinical-border font-body text-sm">
            {d.especialistas.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-2 text-ink">
                <span>{s.nombre} <span className="text-ink-dim">· {s.especialidad} · {s.ciudad}</span></span>
                <Button size="icon" variant="ghost" aria-label="Eliminar" onClick={async () => { await borrarEspecialista({ data: { id: s.id } }); router.invalidate(); }}><Trash2 /></Button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
