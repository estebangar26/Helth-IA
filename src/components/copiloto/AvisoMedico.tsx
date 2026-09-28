import { ShieldAlert } from "lucide-react";

export const AVISO_MEDICO =
  "Esta información es orientativa y debe ser validada por un profesional de la salud. No reemplaza el criterio médico.";

export function AvisoMedico({ inverso = false }: { inverso?: boolean }) {
  return (
    <p className={`flex gap-2 border-t pt-4 font-body text-xs leading-relaxed ${inverso ? "border-primary-foreground/20 text-primary-foreground/75" : "border-clinical-border text-ink-dim"}`}>
      <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{AVISO_MEDICO}</span>
    </p>
  );
}
