/** FRONTEND · Pantalla para autorizar a un asistente de IA a usar HelthIA como el usuario. */
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { Fondo } from "@/components/copiloto/Fondo";
import { Button } from "@/components/ui/button";

type Resp = { data: { redirect_url?: string; redirect_to?: string; client?: { name?: string } } | null; error: { message: string } | null };
const oauth = (supabase.auth as unknown as { oauth: {
  getAuthorizationDetails: (id: string) => Promise<Resp>;
  approveAuthorization: (id: string) => Promise<Resp>;
  denyAuthorization: (id: string) => Promise<Resp>;
} }).oauth;

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s["authorization_id"] === "string" ? s["authorization_id"] : "",
  }),
  head: () => ({ meta: [
    { title: "Autorizar conexión · HelthIA" },
    { name: "description", content: "Autorice a un asistente de IA a consultar su información en HelthIA." },
    { property: "og:title", content: "Autorizar conexión · HelthIA" },
    { property: "og:description", content: "Conexión segura de asistentes con HelthIA." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Falta el identificador de autorización.");
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/auth", search: { redirect: undefined, next: location.pathname + location.searchStr } });
  },
  loader: async ({ location }) => {
    const id = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await oauth.getAuthorizationDetails(id);
    if (error) throw new Error(error.message);
    const inmediato = data?.redirect_url ?? data?.redirect_to;
    if (inmediato && !data?.client) throw redirect({ href: inmediato });
    return data;
  },
  component: Consentimiento,
  errorComponent: ({ error }) => <main className="p-8 font-body text-ink">No se pudo cargar la solicitud: {String((error as Error)?.message ?? error)}</main>,
});

function Consentimiento() {
  const detalles = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nombre = detalles?.client?.name ?? "una aplicación";

  async function decidir(aprobar: boolean) {
    setOcupado(true);
    const { data, error } = aprobar ? await oauth.approveAuthorization(authorization_id) : await oauth.denyAuthorization(authorization_id);
    const destino = data?.redirect_url ?? data?.redirect_to;
    if (error || !destino) { setOcupado(false); setError(error?.message ?? "No se recibió la redirección."); return; }
    window.location.href = destino;
  }

  return (
    <>
      <Fondo />
      <main className="mx-auto mt-24 max-w-md space-y-4 rounded-lg border border-clinical-border bg-panel p-6 shadow-md">
        <h1 className="font-display text-2xl font-semibold text-ink">Conectar {nombre} con HelthIA</h1>
        <p className="font-body text-sm text-ink-dim">{nombre} podrá ver sus exámenes y medicaciones y registrar medicamentos en su nombre. Puede revocarlo cuando quiera.</p>
        {error && <p role="alert" className="font-body text-sm text-alert">{error}</p>}
        <div className="flex gap-3">
          <Button disabled={ocupado} onClick={() => decidir(true)} className="flex-1">Autorizar</Button>
          <Button disabled={ocupado} variant="outline" onClick={() => decidir(false)} className="flex-1">Rechazar</Button>
        </div>
      </main>
    </>
  );
}
