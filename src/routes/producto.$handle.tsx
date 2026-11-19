/** FRONTEND · Detalle de un dispositivo de la tienda (datos desde Shopify). */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, Loader2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { NavegacionPublica } from "@/components/copiloto/NavegacionPublica";
import { CarritoCompras } from "@/components/tienda/CarritoCompras";
import { fichaEditorial } from "@/components/copiloto/TiendaIoT";
import { obtenerProducto, formatoPrecio } from "@/lib/shopify/storefront";
import { useCartStore } from "@/stores/cartStore";
import { useCartSync } from "@/hooks/useCartSync";

export const Route = createFileRoute("/producto/$handle")({
  head: () => ({
    meta: [
      { title: "Dispositivo médico conectado · Tienda HelthIA" },
      { name: "description", content: "Detalle, precio de referencia y compra de un dispositivo médico conectado en la Tienda HelthIA." },
      { property: "og:title", content: "Dispositivo médico conectado · Tienda HelthIA" },
      { property: "og:description", content: "Precio en pesos colombianos y compra segura con Shopify." },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Producto,
});

function Producto() {
  useCartSync();
  const { handle } = Route.useParams();
  const { data: p, isLoading } = useQuery({ queryKey: ["shopify-producto", handle], queryFn: () => obtenerProducto(handle) });
  const addItem = useCartStore((s) => s.addItem);
  const agregando = useCartStore((s) => s.isLoading);
  const ficha = p ? fichaEditorial(p.node.title) : undefined;
  const v = p?.node.variants.edges[0]?.node;
  const img = p?.node.images.edges[0]?.node;

  return (
    <div className="min-h-screen bg-surface text-ink">
      <NavegacionPublica />
      <Toaster position="top-center" />
      <main className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <Link to="/tienda" className="inline-flex items-center gap-1 font-body text-sm text-primary"><ArrowLeft className="size-4" /> Volver a la tienda</Link>
          <CarritoCompras />
        </div>
        {isLoading ? (
          <p className="mt-10 flex items-center gap-2 font-body text-sm text-ink-dim"><Loader2 className="size-4 animate-spin" /> Cargando…</p>
        ) : !p ? (
          <p className="mt-10 font-body text-sm text-ink-dim">No se encontró este producto.</p>
        ) : (
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <div className="rounded-md border border-clinical-border bg-panel">{img && <img src={img.url} alt={img.altText ?? p.node.title} className="aspect-square w-full object-contain p-8" />}</div>
            <div className="min-w-0">
              <p className="font-body text-xs font-semibold text-primary">{p.node.vendor} · {p.node.productType}</p>
              <h1 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">{p.node.title}</h1>
              {v && <p className="mt-4 font-body text-2xl font-bold text-ink">{formatoPrecio(v.price.amount, v.price.currencyCode)}</p>}
              <p className="mt-4 font-body leading-7 text-ink-dim">{ficha?.descripcion ?? p.node.description}</p>
              {ficha?.nota && <p className="mt-3 font-body text-xs leading-5 text-ink-dim">{ficha.nota}</p>}
              <Button size="lg" className="mt-6 w-full" disabled={!v || agregando} onClick={() => v && addItem({ product: p, variantId: v.id, variantTitle: v.title, price: v.price, quantity: 1, selectedOptions: v.selectedOptions || [] })}>
                {agregando ? <Loader2 className="size-4 animate-spin" /> : <><ShoppingCart /> Agregar al carrito</>}
              </Button>
              {ficha && <a href={ficha.fuente} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1 font-body text-xs text-primary underline underline-offset-4">Ficha del fabricante <ExternalLink className="size-3" /></a>}
              <p className="mt-6 border-l-2 border-brand-lime pl-4 font-body text-sm leading-6 text-ink-dim">Precio de referencia. Consulte con su profesional de salud antes de comprar.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
