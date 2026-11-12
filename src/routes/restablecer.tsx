import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Fondo } from "@/components/copiloto/Fondo";
import { Button } from "@/components/ui/button";
import { CampoClave, ReglasClave, claveCumple } from "@/components/copiloto/ClaveSegura";
import { leerEnlaceRecuperacion, limpiarEnlaceRecuperacion, obtenerClienteRecuperacion } from "@/lib/copiloto/recuperacion";

export const Route = createFileRoute("/restablecer")({
  // El formulario depende de credenciales que solo existen en el navegador.
  ssr: false,
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
  const [clave2, setClave2] = useState("");
  const [msg, setMsg] = useState<string | null>("Comprobando el enlace de recuperación…");
  const [listo, setListo] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    let activo = true;
    const supabase = obtenerClienteRecuperacion();
    const enlace = leerEnlaceRecuperacion(window.location.href);

    // Usa la función nativa: el enrutador no debe interpretar la retirada de tokens
    // como una navegación, pues eso reiniciaría los campos del formulario.
    if (enlace.tipo !== "ausente") {
      History.prototype.replaceState.call(window.history, window.history.state, "", limpiarEnlaceRecuperacion(window.location.href));
    }

    const { data } = supabase.auth.onAuthStateChange((evento, sesion) => {
      if (activo && evento === "PASSWORD_RECOVERY" && sesion) {
        setListo(true);
        setMsg(null);
      }
    });

    async function prepararRecuperacion() {
      if (enlace.tipo === "error") {
        setMsg("El enlace venció o ya se usó. Solicite uno nuevo y abra solo el correo más reciente.");
        return;
      }
      if (enlace.tipo === "ausente") {
        setMsg("Abra el enlace del correo más reciente para recuperar su contraseña.");
        return;
      }

      const resultado = enlace.tipo === "implicito"
        ? await supabase.auth.setSession({ access_token: enlace.accessToken, refresh_token: enlace.refreshToken })
        : enlace.tipo === "codigo"
          ? await supabase.auth.exchangeCodeForSession(enlace.codigo)
          : await supabase.auth.verifyOtp({ token_hash: enlace.tokenHash, type: "recovery" });

      if (!activo) return;
      if (resultado.error || !resultado.data.session) {
        setListo(false);
        setMsg("El enlace venció o ya se usó. Solicite uno nuevo y abra solo el correo más reciente.");
        return;
      }

      // Revalida el usuario con el servidor antes de habilitar el cambio.
      const { data: usuario, error } = await supabase.auth.getUser();
      if (!activo) return;
      if (error || !usuario.user) {
        setListo(false);
        setMsg("No se pudo validar el enlace. Solicite uno nuevo.");
        return;
      }
      setListo(true);
      setMsg(null);
    }

    void prepararRecuperacion();
    return () => {
      activo = false;
      data.subscription.unsubscribe();
    };
  }, []);

  async function guardar(e: React.SyntheticEvent) {
    e.preventDefault();
    const supabase = obtenerClienteRecuperacion();
    if (guardando) return;
    if (!listo) return setMsg("El enlace todavía no está validado. Espere un momento o solicite uno nuevo.");
    if (!claveCumple(clave)) return setMsg("La contraseña no cumple los requisitos de seguridad.");
    if (clave !== clave2) return setMsg("Las contraseñas no coinciden.");

    setGuardando(true);
    setMsg(null);
    const { error } = await supabase.auth.updateUser({ password: clave });
    if (error) {
      setGuardando(false);
      const t = `${error.code ?? ""} ${error.message}`.toLowerCase();
      if (t.includes("same_password") || t.includes("different from the old")) return setMsg("La nueva contraseña debe ser distinta a la anterior.");
      if (t.includes("weak") || t.includes("pwned") || t.includes("leaked")) return setMsg("Esa contraseña es muy común o apareció en filtraciones. Elija otra más segura.");
      if (t.includes("session") || t.includes("jwt") || t.includes("expired")) return setMsg("El enlace venció o ya se usó. Solicite uno nuevo.");
      return setMsg(`No se pudo guardar: ${error.message}`);
    }

    // La recuperación termina sin dejar una sesión abierta en este dispositivo.
    await supabase.auth.signOut();
    navegar({ to: "/auth", search: { redirect: undefined, recuperada: true }, replace: true });
  }

  return (
    <>
      <Fondo />
      <form onSubmit={guardar} className="mx-auto mt-24 max-w-md space-y-4 rounded-lg border border-clinical-border bg-panel p-6 shadow-md">
        <h1 className="font-display text-2xl font-semibold text-ink">Nueva contraseña</h1>
        <CampoClave etiqueta="Nueva contraseña" valor={clave} onChange={setClave} />
        <ReglasClave clave={clave} />
        <CampoClave etiqueta="Confirmar contraseña" valor={clave2} onChange={setClave2} />
        {msg && <p role="status" className="font-body text-sm text-alert">{msg}</p>}
        <Button type="submit" onClick={guardar} className="w-full" disabled={!listo || guardando}>{guardando ? "Guardando…" : "Guardar"}</Button>
        <Link to="/auth" search={{ redirect: undefined }} className="block text-center font-body text-sm text-ink-dim">Volver</Link>
      </form>
    </>
  );
}
