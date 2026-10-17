/** FRONTEND · Asistente flotante de HelthIA (una conversación guardada en este navegador). */
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Bot, RotateCcw, Send, Square, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

import { AVISO_MEDICO } from "@/components/copiloto/AvisoMedico";
import { Button } from "@/components/ui/button";

const CLAVE = "helthia-asistente";

export function AsistenteChat() {
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState("");
  const [error, setError] = useState<string | null>(null);
  const entrada = useRef<HTMLTextAreaElement>(null);
  const fin = useRef<HTMLDivElement>(null);
  const { messages, setMessages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({ api: "/api/asistente" }),
    onError: (e) => setError(e.message || "No se pudo conectar con el asistente."),
  });
  const ocupado = status === "submitted" || status === "streaming";

  useEffect(() => {
    try { const g = localStorage.getItem(CLAVE); if (g) setMessages(JSON.parse(g) as UIMessage[]); } catch { /* historial dañado */ }
  }, [setMessages]);
  useEffect(() => {
    if (status === "ready" && messages.length) localStorage.setItem(CLAVE, JSON.stringify(messages));
    fin.current?.scrollIntoView({ block: "end" });
    if (abierto && !ocupado) entrada.current?.focus();
  }, [messages, status, abierto, ocupado]);

  function enviar(e?: React.FormEvent) {
    e?.preventDefault();
    if (!texto.trim() || ocupado) return;
    setError(null);
    sendMessage({ text: texto.trim() });
    setTexto("");
  }

  function reiniciar() { stop(); setMessages([]); localStorage.removeItem(CLAVE); setError(null); }

  if (!abierto) {
    return (
      <button onClick={() => setAbierto(true)} aria-label="Abrir asistente HelthIA" className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-brand-blue px-4 py-3 font-body text-sm font-semibold text-primary-foreground shadow-lg hover:opacity-90">
        <Bot className="size-5" aria-hidden="true" /> ¿Le ayudo?
      </button>
    );
  }

  return (
    <section aria-label="Asistente HelthIA" className="fixed inset-x-3 bottom-3 z-50 flex max-h-[80vh] flex-col overflow-hidden rounded-xl border border-clinical-border bg-panel shadow-2xl sm:inset-x-auto sm:right-5 sm:w-[380px]">
      <header className="flex items-center gap-2 bg-brand-blue px-4 py-3 text-primary-foreground">
        <Bot className="size-5" aria-hidden="true" />
        <p className="flex-1 font-display text-sm font-bold">Asistente HelthIA</p>
        <button onClick={reiniciar} aria-label="Nueva conversación" title="Nueva conversación"><RotateCcw className="size-4" /></button>
        <button onClick={() => setAbierto(false)} aria-label="Cerrar asistente"><X className="size-5" /></button>
      </header>
      <div className="flex-1 space-y-3 overflow-y-auto p-4 font-body text-sm">
        {messages.length === 0 && (
          <p className="text-ink-dim">Hola. Puedo ayudarle a moverse por la página o darle orientación general sobre síntomas. ¿Qué necesita?</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "ml-8 rounded-lg bg-brand-blue px-3 py-2 text-primary-foreground" : "mr-4 text-ink"}>
            {m.parts.map((p, i) => p.type === "text" ? (
              <div key={i} className="space-y-2 [&_a]:font-semibold [&_a]:text-brand-blue [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"><ReactMarkdown>{p.text}</ReactMarkdown></div>
            ) : null)}
          </div>
        ))}
        {status === "submitted" && <p className="animate-pulse text-ink-dim">Escribiendo…</p>}
        {error && <p role="alert" className="text-destructive">{error}</p>}
        <div ref={fin} />
      </div>
      <p className="border-t border-clinical-border px-4 py-2 font-body text-[11px] leading-snug text-ink-dim">{AVISO_MEDICO} En una emergencia llame al 123.</p>
      <form onSubmit={enviar} className="flex items-end gap-2 border-t border-clinical-border p-3">
        <textarea ref={entrada} value={texto} rows={1} onChange={(e) => setTexto(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) enviar(e); }} placeholder="Escriba su pregunta o síntomas…" className="max-h-28 flex-1 resize-none rounded-md border border-clinical-border bg-panel px-3 py-2 font-body text-sm text-ink outline-none focus:border-brand-blue" />
        {ocupado
          ? <Button type="button" size="icon" variant="outline" onClick={stop} aria-label="Detener"><Square /></Button>
          : <Button type="submit" size="icon" aria-label="Enviar" disabled={!texto.trim()}><Send /></Button>}
      </form>
    </section>
  );
}
