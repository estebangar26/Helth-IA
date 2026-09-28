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
    if (location.pathname.startsWith("/medico") && rol !== "medico") throw redirect({ to: "/paciente" });
    if (location.pathname.startsWith("/paciente") && rol !== "paciente") throw redirect({ to: "/medico" });
    return { user: data.user, rol };
  },
  component: () => <Outlet />,
});
