import { createFileRoute, Outlet, useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";

import { Encabezado } from "@/components/copiloto/Encabezado";
import { Fondo } from "@/components/copiloto/Fondo";
import { NavegacionPaciente } from "@/components/copiloto/NavegacionPaciente";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { obtenerMiPanel } from "@/lib/copiloto/examenes.functions";

export const Route = createFileRoute("/_authenticated/paciente")({
  loader: () => obtenerMiPanel(),
  component: EspacioPaciente,
});

function EspacioPaciente() {
  const panel = Route.useLoaderData();
  const router = useRouter();
  const queryClient = useQueryClient();

  async function salir() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    router.navigate({ to: "/auth", search: { redirect: undefined }, replace: true });
  }

  return (
    <>
      <Fondo />
      <div className="mx-auto min-h-screen max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Encabezado
          paciente={panel.paciente}
          accion={
            <Button onClick={salir} variant="outline" size="icon" title="Cerrar sesión" aria-label="Cerrar sesión">
              <LogOut aria-hidden="true" />
            </Button>
          }
        />
        <div className="grid min-w-0 gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <NavegacionPaciente paciente={panel.paciente} />
          <div className="min-w-0"><Outlet /></div>
        </div>
      </div>
    </>
  );
}
