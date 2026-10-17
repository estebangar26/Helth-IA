/** FRONTEND · Campo de contraseña con botón para mostrarla y reglas de seguridad. */
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const REGLAS_CLAVE = [
  { texto: "Mínimo 8 caracteres", ok: (c: string) => c.length >= 8 },
  { texto: "Una mayúscula", ok: (c: string) => /[A-ZÁÉÍÓÚÑ]/.test(c) },
  { texto: "Una minúscula", ok: (c: string) => /[a-záéíóúñ]/.test(c) },
  { texto: "Un número", ok: (c: string) => /\d/.test(c) },
  { texto: "Un carácter especial (!@#$…)", ok: (c: string) => /[^A-Za-z0-9ÁÉÍÓÚÑáéíóúñ]/.test(c) },
];

export const claveCumple = (c: string) => REGLAS_CLAVE.every((r) => r.ok(c));

export function CampoClave({ etiqueta, valor, onChange }: { etiqueta: string; valor: string; onChange: (v: string) => void }) {
  const [ver, setVer] = useState(false);
  return (
    <div>
      <Label className="font-body text-xs font-semibold text-ink-dim">{etiqueta}</Label>
      <div className="relative mt-1.5">
        <Input type={ver ? "text" : "password"} value={valor} required onChange={(e) => onChange(e.target.value)} className="bg-panel pr-10" />
        <button type="button" onClick={() => setVer(!ver)} aria-label={ver ? "Ocultar contraseña" : "Mostrar contraseña"} className="absolute inset-y-0 right-0 grid w-10 place-items-center text-ink-dim hover:text-brand-blue">
          {ver ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
}

export function ReglasClave({ clave }: { clave: string }) {
  return (
    <ul className="grid gap-1 font-body text-xs sm:grid-cols-2">
      {REGLAS_CLAVE.map((r) => (
        <li key={r.texto} className={r.ok(clave) ? "text-brand-lime" : "text-ink-dim"}>{r.ok(clave) ? "✓" : "•"} {r.texto}</li>
      ))}
    </ul>
  );
}
