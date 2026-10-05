/**
 * FRONTEND · Pantalla de acceso (ruta "/auth")
 * --------------------------------------------
 * Ruta pública. Permite crear cuenta o entrar con correo y contraseña, o bien
 * ingresar con Google. Al terminar, lleva al panel del paciente.
 */

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Fondo } from "@/components/copiloto/Fondo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { obtenerMiRol } from "@/lib/copiloto/roles.functions";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: search["redirect"] === "/medico" ? "/medico" : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Ingresar · HelthIA" },
      {
        name: "description",
        content:
          "Entre a su cuenta de HelthIA para registrar sus exámenes de laboratorio y seguir su riesgo en el tiempo.",
      },
      { property: "og:title", content: "Ingresar a HelthIA" },
      {
        property: "og:description",
        content: "Acceso seguro al seguimiento de sus exámenes y biomarcadores.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PantallaAcceso,
});

function PantallaAcceso() {
  const navegar = useNavigate();
  const { redirect } = Route.useSearch();
  const [modo, setModo] = useState<"entrar" | "registrar">("entrar");
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [nombre, setNombre] = useState("");
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function destinoSegunRol(): Promise<"/paciente" | "/medico" | "/admin"> {
    const r = await obtenerMiRol();
    if (r === "admin") return "/admin";
    return r === "medico" ? "/medico" : "/paciente";
  }

  useEffect(() => {
    void supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      navegar({ to: await destinoSegunRol(), replace: true });
    });
  }, [navegar]);

  /** Envía el formulario de correo y contraseña. */
  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setCargando(true);
    setMensaje(null);

    if (modo === "registrar") {
      const { data, error } = await supabase.auth.signUp({
        email: correo,
        password: clave,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          data: { nombre },
        },
      });
      setCargando(false);
      if (error) {
        setMensaje(error.message);
        return;
      }
      // Si la cuenta requiere confirmación por correo no hay sesión todavía.
      if (!data.session) {
        setMensaje(
          "Le enviamos un correo de confirmación. Ábralo para activar su cuenta y luego ingrese.",
        );
        return;
      }
      navegar({ to: await destinoSegunRol() });
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: correo,
      password: clave,
    });
    setCargando(false);
    if (error) {
      setMensaje("Correo o contraseña incorrectos.");
      return;
    }
    navegar({ to: await destinoSegunRol() });
  }

  /** Ingreso con Google gestionado por Lovable Cloud. */
  async function entrarConGoogle() {
    setMensaje(null);
    const resultado = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (resultado.error) {
      setMensaje("No se pudo ingresar con Google.");
      return;
    }
    if (resultado.redirected) return;
    navegar({ to: await destinoSegunRol() });
  }

  return (
    <>
      <Fondo />

      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
        <Link to="/" className="mb-6 font-display text-sm text-ink-dim hover:text-ink">
          ← Volver al inicio
        </Link>

        <div className="rounded-lg border border-clinical-border bg-panel p-6 shadow-md">
          <div className="mb-5 grid size-12 place-items-center rounded-full bg-brand-blue/10 font-body font-bold text-brand-blue">HI</div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            {modo === "entrar" ? "Ingrese a HelthIA" : "Cree su cuenta"}
          </h1>
          <p className="mt-1 font-body text-sm text-ink-dim">
            Sus exámenes son privados y solo los ven usted y los profesionales que autorice.
          </p>

          <form onSubmit={enviar} className="mt-6 space-y-4">
            {modo === "registrar" && (
              <Campo
                etiqueta="Nombre completo"
                valor={nombre}
                onChange={setNombre}
                tipo="text"
                requerido
              />
            )}
            <Campo etiqueta="Correo" valor={correo} onChange={setCorreo} tipo="email" requerido />
            <Campo
              etiqueta="Contraseña"
              valor={clave}
              onChange={setClave}
              tipo="password"
              requerido
            />

            {mensaje && <p className="font-body text-sm text-alert">{mensaje}</p>}

            <Button
              type="submit"
              disabled={cargando}
              className="w-full"
            >
              {cargando ? "Un momento…" : modo === "entrar" ? "Entrar" : "Crear cuenta"}
            </Button>
          </form>

          <Button
            type="button"
            onClick={entrarConGoogle}
            variant="outline"
            className="mt-3 w-full"
          >
            Continuar con Google
          </Button>

          {modo === "entrar" && (
            <Button type="button" variant="link" className="mt-2 w-full" onClick={async () => {
              if (!correo) return setMensaje("Escriba su correo para enviarle el enlace de recuperación.");
              const { error } = await supabase.auth.resetPasswordForEmail(correo, { redirectTo: `${window.location.origin}/restablecer` });
              setMensaje(error ? "No se pudo enviar el enlace." : "Si el correo está registrado, recibirá un enlace para crear una nueva contraseña.");
            }}>Olvidé mi contraseña</Button>
          )}

          <Button
            type="button"
            onClick={() => {
              setModo(modo === "entrar" ? "registrar" : "entrar");
              setMensaje(null);
            }}
            variant="link"
            className="mt-3 w-full"
          >
            {modo === "entrar"
              ? "No tengo cuenta · Registrarme"
              : "Ya tengo cuenta · Ingresar"}
          </Button>
        </div>
      </div>
    </>
  );
}

/** Campo de texto reutilizable del formulario. */
function Campo({
  etiqueta,
  valor,
  onChange,
  tipo,
  requerido,
}: {
  etiqueta: string;
  valor: string;
  onChange: (v: string) => void;
  tipo: string;
  requerido?: boolean;
}) {
  return (
    <div className="block">
      <Label className="font-body text-xs font-semibold text-ink-dim">{etiqueta}</Label>
      <Input
        type={tipo}
        value={valor}
        required={requerido}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 bg-panel"
      />
    </div>
  );
}
