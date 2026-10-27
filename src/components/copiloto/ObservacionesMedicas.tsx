import { useState } from 'react';
import { useRouter } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { Bell, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { crearObservacion, type ObservacionMedica } from '@/lib/copiloto/observaciones.functions';
import type { Examen } from '@/lib/copiloto/tipos';

export function ObservacionesMedicas({ observaciones, examenes, pacienteId }: { observaciones: ObservacionMedica[]; examenes: Examen[]; pacienteId?: string }) {
  const [examenId, setExamenId] = useState(examenes[0]?.id ?? '');
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState('');
  const enviar = useServerFn(crearObservacion);
  const router = useRouter();
  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!pacienteId || enviando) return;
    setEnviando(true); setAviso('');
    try {
      await enviar({ data: { pacienteId, examenId, mensaje } });
      setMensaje(''); await router.invalidate(); setAviso('Observación enviada al paciente.');
    } catch (error) { setAviso(error instanceof Error ? error.message : 'No se pudo enviar la observación.'); }
    finally { setEnviando(false); }
  }
  return <section className="space-y-4 border-y border-clinical-border py-5">
    <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink"><Bell className="size-5 text-brand-blue" aria-hidden="true" /> Observaciones de su médico {observaciones.length > 0 && <span className="font-body text-sm text-ink-dim">({observaciones.length})</span>}</h2>
    {pacienteId && <form onSubmit={guardar} className="space-y-3">
      <label className="block font-body text-sm text-ink">Examen observado</label>
      <Select value={examenId} onValueChange={setExamenId}><SelectTrigger aria-label="Examen observado" className="h-auto min-h-10 w-full [&_span]:whitespace-normal"><SelectValue placeholder="Seleccione un examen" /></SelectTrigger><SelectContent>{examenes.map(e => <SelectItem key={e.id} value={e.id}>{e.titulo} · {e.fecha}</SelectItem>)}</SelectContent></Select>
      <label htmlFor="observacion-medica" className="block font-body text-sm text-ink">Observación para el paciente</label>
      <Textarea id="observacion-medica" value={mensaje} onChange={e => setMensaje(e.target.value)} maxLength={2000} required rows={4} placeholder="Escriba lo observado en el examen…" />
      <div className="flex flex-wrap items-center justify-between gap-2"><span className="font-body text-xs text-ink-dim">{mensaje.length}/2000</span><Button type="submit" disabled={enviando || !examenId || !mensaje.trim()}><Send className="size-4" aria-hidden="true" />{enviando ? 'Enviando…' : 'Enviar observación'}</Button></div>
      {aviso && <p role="status" className="font-body text-sm text-brand-blue">{aviso}</p>}
    </form>}
    {observaciones.length === 0 && <p className="font-body text-sm text-ink-dim">Aún no hay observaciones médicas.</p>}
    <ul className="space-y-3">{observaciones.map(o => <li key={o.id} className="rounded-md border border-clinical-border bg-panel p-4">
      <p className="font-body text-sm font-semibold text-ink">{o.medico_nombre || 'Médico autorizado'}</p>
      <p className="mt-1 font-body text-xs text-ink-dim">{new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Bogota' }).format(new Date(o.creado_en))} · Hora de Colombia</p>
      <p className="mt-1 break-words font-body text-xs text-brand-blue">{examenes.find(e => e.id === o.examen_id)?.titulo ?? 'Examen asociado'}</p>
      <p className="mt-3 whitespace-pre-wrap break-words font-body text-sm leading-relaxed text-ink">{o.mensaje}</p>
    </li>)}</ul>
  </section>;
}