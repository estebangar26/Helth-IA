/** FRONTEND · Catálogo público de dispositivos médicos conectados. */
import { createFileRoute } from "@tanstack/react-router";
import { NavegacionPublica } from "@/components/copiloto/NavegacionPublica";
import { TiendaIoT } from "@/components/copiloto/TiendaIoT";

export const Route = createFileRoute("/tienda")({
  head: () => ({
    meta: [
      { title: "Tienda HelthIA · Dispositivos médicos conectados" },
      { name: "description", content: "Explore dispositivos médicos conectados y consulte productos en Amazon, Alibaba y fabricantes de tecnología médica." },
      { property: "og:title", content: "Tienda HelthIA · Tecnología médica conectada" },
      { property: "og:description", content: "Catálogo de dispositivos para seguimiento fisiológico en casa y monitorización profesional, con enlaces a proveedores." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Tienda,
});

function Tienda() {
  return (
    <div className="min-h-screen bg-surface text-ink">
      <NavegacionPublica />
      <main><TiendaIoT /></main>
      <footer className="border-t border-clinical-border bg-panel px-4 py-6 text-center font-body text-xs text-ink-dim">
        HelthIA · Apoyo para el seguimiento clínico
      </footer>
    </div>
  );
}