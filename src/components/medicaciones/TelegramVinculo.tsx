/** Tarjeta para vincular Telegram y recibir recordatorios de tomas. */
import { useEffect, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Button } from '@/components/ui/button';
import { estadoTelegram, enlaceTelegram, desvincularTelegram } from '@/lib/telegram/telegram.functions';

export function TelegramVinculo() {
  const estado = useServerFn(estadoTelegram), enlace = useServerFn(enlaceTelegram), quitar = useServerFn(desvincularTelegram);
  const [vinculado, setVinculado] = useState<boolean | null>(null);
  useEffect(() => { void estado().then(r => setVinculado(r.vinculado)); }, [estado]);
  return <div className="space-y-2 border-l-4 border-brand-blue pl-3 text-sm">
    <p className="font-semibold">Recordatorios por Telegram</p>
    <p className="text-ink-dim">Recibe un aviso a la hora de cada toma de tus medicamentos activos, con el médico que lo indicó. Requiere aceptar la autorización de datos de salud.</p>
    {vinculado ? <div className="flex flex-wrap items-center gap-2"><span>✅ Telegram vinculado</span><Button variant="ghost" size="sm" onClick={() => void quitar().then(() => setVinculado(false))}>Desvincular</Button></div>
      : <Button variant="outline" disabled={vinculado === null} onClick={async () => { const w = window.open('', '_blank'); const r = await enlace(); if (w) w.location.href = r.url; else window.location.href = r.url; }}>Conectar Telegram</Button>}
    {vinculado === false && <p className="text-xs text-ink-dim">Se abrirá el bot @helthIA_bot; pulsa «Iniciar». Luego recarga esta página.</p>}
  </div>;
}
