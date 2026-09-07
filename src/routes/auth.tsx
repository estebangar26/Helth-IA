/**
 * FRONTEND · Pantalla de acceso (ruta "/auth")
 * --------------------------------------------
 * Ruta pública. Permite crear cuenta o entrar con correo y contraseña, o bien
 * ingresar con Google. Al terminar, lleva al panel del paciente.
 */

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Fondo } from "@/components/copiloto/Fondo";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Ingresar · Copiloto de Salud" },
      {
        name: "description",
        content:
          "Entre a su cuenta del Copiloto de Salud para registrar sus exámenes de laboratorio y seguir su riesgo en el tiempo.",
      },
      { property: "og:title", content: "Ingresar al Copiloto de Salud" },
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
  const [modo, setModo] = useState<"entrar" | "registrar">("entrar");
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [nombre, setNombre] = useState("");
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

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
          emailRedirectTo: `${window.location.origin}/panel`,
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
      navegar({ to: "/panel" });
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
    navegar({ to: "/panel" });
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
    navegar({ to: "/panel" });
  }

  return (
    <>
      <Fondo />

      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
        <Link to="/" className="mb-6 font-display text-sm text-ink-dim hover:text-ink">
          ← Volver al inicio
        </Link>

        <div className="rounded-[min(2vw,18px)] bg-white/[0.05] p-6 ring-1 ring-white/10 backdrop-blur-xl">
          <h1 className="font-display text-2xl font-semibold text-ink">
            {modo === "entrar" ? "Ingrese a su copiloto" : "Cree su cuenta"}
          </h1>
          <p className="mt-1 font-body text-sm text-ink-dim">
            Sus exámenes quedan guardados de forma privada y solo usted puede verlos.
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

            <button
              type="submit"
              disabled={cargando}
              className="w-full rounded-[min(1vw,8px)] bg-accent-teal/20 px-4 py-2.5 font-display text-sm font-semibold text-accent-teal ring-1 ring-accent-teal/30 transition-colors hover:bg-accent-teal/30 disabled:opacity-50"
            >
              {cargando ? "Un momento…" : modo === "entrar" ? "Entrar" : "Crear cuenta"}
            </button>
          </form>

          <button
            type="button"
            onClick={entrarConGoogle}
            className="mt-3 w-full rounded-[min(1vw,8px)] bg-white/[0.06] px-4 py-2.5 font-display text-sm font-medium text-ink ring-1 ring-white/10 transition-colors hover:bg-white/[0.1]"
          >
            Continuar con Google
          </button>

          <button
            type="button"
            onClick={() => {
              setModo(modo === "entrar" ? "registrar" : "entrar");
              setMensaje(null);
            }}
            className="mt-5 w-full font-body text-sm text-ink-dim underline-offset-4 hover:text-ink hover:underline"
          >
            {modo === "entrar"
              ? "No tengo cuenta · Registrarme"
              : "Ya tengo cuenta · Ingresar"}
          </button>
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
    <label className="block">
      <span className="font-display text-[11px] font-semibold tracking-[0.1em] uppercase text-ink-dim">
        {etiqueta}
      </span>
      <input
        type={tipo}
        value={valor}
        required={requerido}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-[min(1vw,8px)] bg-white/[0.04] px-3 py-2 font-body text-sm text-ink ring-1 ring-white/10 outline-none placeholder:text-ink-dim focus:ring-accent-teal/40"
      />
    </label>
  );
}
