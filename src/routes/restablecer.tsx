import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { Fondo } from "@/components/copiloto/Fondo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/restablecer")({
  head: () => ({ meta: [
    { title: "Nueva contraseña · HelthIA" },
    { name: "description", content: "Cree una nueva contraseña para su cuenta de HelthIA." },
    { property: "og:title", content: "Nueva contraseña · HelthIA" },
    { property: "og:description", content: "Recupere el acceso a su cuenta de HelthIA." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Restablecer,
});

function Restablecer() {
  const navegar = useNavigate();
  const [clave, setClave] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (clave.length < 8) return setMsg("Use al menos 8 caracteres.");
    const { error } = await supabase.auth.updateUser({ password: clave });
    if (error) return setMsg("El enlace venció o no es válido. Solicite uno nuevo.");
    navegar({ to: "/auth", search: { redirect: undefined } });
  }

  return (
    <>
      <Fondo />
      <form onSubmit={guardar} className="mx-auto mt-24 max-w-md space-y-4 rounded-lg border border-clinical-border bg-panel p-6 shadow-md">
        <h1 className="font-display text-2xl font-semibold text-ink">Nueva contraseña</h1>
        <Input type="password" required value={clave} onChange={(e) => setClave(e.target.value)} placeholder="Nueva contraseña" />
        {msg && <p className="font-body text-sm text-alert">{msg}</p>}
        <Button type="submit" className="w-full">Guardar</Button>
        <Link to="/auth" search={{ redirect: undefined }} className="block text-center font-body text-sm text-ink-dim">Volver</Link>
      </form>
    </>
  );
}
