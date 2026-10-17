/** FRONTEND · Registro de medicaciones del paciente (protegido por RLS: solo las propias). */
import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Pill, Plus, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/paciente/medicaciones")({
  head: () => ({ meta: [
    { title: "Mis medicaciones · HelthIA" },
    { name: "description", content: "Registre los medicamentos que toma, su dosis y frecuencia." },
    { property: "og:title", content: "Mis medicaciones · HelthIA" },
    { property: "og:description", content: "Lista privada de medicamentos del paciente." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Medicaciones,
});

type Med = { id: string; nombre: string; dosis: string | null; frecuencia: string | null; notas: string | null };

function Medicaciones() {
  const [lista, setLista] = useState<Med[]>([]);
  const [f, setF] = useState({ nombre: "", dosis: "", frecuencia: "", notas: "" });
  const [msg, setMsg] = useState<string | null>(null);
  const [editando, setEditando] = useState<string | null>(null);

  async function cargar() {
    const { data } = await supabase.from("medicaciones").select("id,nombre,dosis,frecuencia,notas").order("creado_en", { ascending: false });
    setLista(data ?? []);
  }
  useEffect(() => { void cargar(); }, []);

  async function agregar(e: React.FormEvent) {
    e.preventDefault();
    const { data: u } = await supabase.auth.getUser();
    if (!u.user || f.nombre.trim().length < 2) return setMsg("Escriba el nombre del medicamento.");
    const fila = { nombre: f.nombre.trim().slice(0, 120), dosis: f.dosis.trim().slice(0, 80) || null, frecuencia: f.frecuencia.trim().slice(0, 80) || null, notas: f.notas.trim().slice(0, 300) || null };
    const { error } = editando
      ? await supabase.from("medicaciones").update(fila).eq("id", editando)
      : await supabase.from("medicaciones").insert({ user_id: u.user.id, ...fila });
    if (error) return setMsg("No se pudo guardar.");
    setF({ nombre: "", dosis: "", frecuencia: "", notas: "" });
    setMsg(editando ? "Cambios guardados." : "Medicamento guardado.");
    setEditando(null);
    void cargar();
  }

  async function borrar(id: string) {
    await supabase.from("medicaciones").delete().eq("id", id);
    void cargar();
  }

  const campo = (k: keyof typeof f, etiqueta: string) => (
    <div><Label className="font-body text-xs font-semibold text-ink-dim">{etiqueta}</Label><Input value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} className="mt-1.5 bg-panel" /></div>
  );

  return (
    <main className="mx-auto max-w-2xl space-y-6">
      <section className="rounded-lg border border-clinical-border bg-panel p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3"><Pill className="text-brand-blue" aria-hidden="true" /><h1 className="font-display text-lg font-bold text-ink">Mis medicaciones</h1></div>
        <form onSubmit={agregar} className="mt-5 space-y-3">
          {campo("nombre", "Medicamento")}
          <div className="grid gap-3 sm:grid-cols-2">{campo("dosis", "Dosis (ej. 850 mg)")}{campo("frecuencia", "Frecuencia (ej. cada 12 horas)")}</div>
          {campo("notas", "Notas (opcional)")}
          {msg && <p role="status" className="font-body text-xs text-ink-dim">{msg}</p>}
          <div className="flex gap-2">
            <Button type="submit">{editando ? <><Pencil aria-hidden="true" /> Guardar cambios</> : <><Plus aria-hidden="true" /> Agregar</>}</Button>
            {editando && <Button type="button" variant="outline" onClick={() => { setEditando(null); setF({ nombre: "", dosis: "", frecuencia: "", notas: "" }); }}>Cancelar</Button>}
          </div>
        </form>
      </section>
      <section className="space-y-2">
        {lista.length === 0 ? <p className="font-body text-sm text-ink-dim">Aún no ha registrado medicamentos.</p> : lista.map((m) => (
          <div key={m.id} className="flex items-start justify-between gap-3 rounded-lg border border-clinical-border bg-panel p-4">
            <div><p className="font-body font-semibold text-ink">{m.nombre}</p><p className="font-body text-sm text-ink-dim">{[m.dosis, m.frecuencia].filter(Boolean).join(" · ")}</p>{m.notas && <p className="font-body text-xs text-ink-dim">{m.notas}</p>}</div>
            <div className="flex shrink-0">
              <Button variant="ghost" size="icon" aria-label={`Editar ${m.nombre}`} onClick={() => { setEditando(m.id); setF({ nombre: m.nombre, dosis: m.dosis ?? "", frecuencia: m.frecuencia ?? "", notas: m.notas ?? "" }); window.scrollTo({ top: 0, behavior: "smooth" }); }}><Pencil /></Button>
              <AlertDialog>
                <AlertDialogTrigger asChild><Button variant="ghost" size="icon" aria-label={`Borrar ${m.nombre}`}><Trash2 /></Button></AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar {m.nombre}?</AlertDialogTitle>
                    <AlertDialogDescription>Este medicamento se borrará de su lista. Esta acción no se puede deshacer.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => borrar(m.id)}>Eliminar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
