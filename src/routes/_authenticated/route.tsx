import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { obtenerMiRol } from "@/lib/copiloto/roles.functions";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({
        to: "/auth",
        search: { redirect: location.pathname.startsWith("/medico") ? "/medico" : undefined },
      });
    }
    const rol = await obtenerMiRol();
    const casa = rol === "admin" ? "/admin" : rol === "medico" ? "/medico" : "/paciente";
    for (const p of ["/paciente", "/medico", "/admin"] as const)
      if (location.pathname.startsWith(p) && casa !== p) throw redirect({ to: casa });
    return { user: data.user, rol };
  },
  component: () => <Outlet />,
});
