import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/panel")({
  beforeLoad: () => { throw redirect({ to: "/paciente", replace: true }); },
});