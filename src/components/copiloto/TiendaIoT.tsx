/** FRONTEND · Tienda HelthIA: productos y precios desde Shopify, con carrito y fichas de fabricante. */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ExternalLink, Loader2, ShoppingBag, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { productosIoT } from "@/lib/copiloto/productos-iot";
import { obtenerProductos, formatoPrecio, type ShopifyProduct } from "@/lib/shopify/storefront";
import { useCartStore } from "@/stores/cartStore";
import { CarritoCompras } from "@/components/tienda/CarritoCompras";

/** Datos editoriales (ficha, uso, crédito de foto) asociados por nombre del producto. */
export const fichaEditorial = (titulo: string) => productosIoT.find((p) => p.nombre === titulo);
const proveedorDe = (p: ShopifyProduct) => fichaEditorial(p.node.title)?.proveedor ?? p.node.vendor;

export function TiendaIoT() {
  const [proveedor, setProveedor] = useState("Todos");
  const { data: catalogo = [], isLoading, isError } = useQuery({ queryKey: ["shopify-productos"], queryFn: () => obtenerProductos(50) });
  const addItem = useCartStore((s) => s.addItem);
  const agregando = useCartStore((s) => s.isLoading);

  const proveedores = ["Todos", ...new Set(catalogo.map(proveedorDe))];
  const productos = catalogo.filter((p) => proveedor === "Todos" || proveedorDe(p) === proveedor);

  const agregar = (p: ShopifyProduct) => {
    const v = p.node.variants.edges[0]?.node;
    if (!v) return;
    void addItem({ product: p, variantId: v.id, variantTitle: v.title, price: v.price, quantity: 1, selectedOptions: v.selectedOptions || [] });
  };

  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="flex items-center gap-2 font-body text-xs font-bold uppercase text-primary"><ShoppingBag className="size-4" aria-hidden="true" /> Tecnología médica conectada</p>
            <h1 className="mt-3 font-display text-4xl font-bold text-ink sm:text-5xl">Tienda HelthIA</h1>
          </div>
          <CarritoCompras />
        </div>
        <p className="mt-4 max-w-2xl font-body leading-7 text-ink-dim">Dispositivos de internet de las cosas médicas para seguir su salud en casa y equipos para profesionales.</p>
        <p className="mt-3 max-w-3xl font-body text-xs leading-5 text-ink-dim">Precios de referencia en pesos colombianos; el pago se realiza en el checkout seguro de Shopify. No existe una alianza comercial anunciada con las marcas.</p>

        <div role="group" aria-label="Filtrar por proveedor" className="mt-8 flex flex-wrap gap-2 border-y border-clinical-border py-4">
          {proveedores.map((nombre) => (
            <Button key={nombre} size="sm" variant={proveedor === nombre ? "default" : "outline"} aria-pressed={proveedor === nombre} onClick={() => setProveedor(nombre)}>{nombre}</Button>
          ))}
        </div>

        {isLoading ? (
          <p className="mt-8 flex items-center gap-2 font-body text-sm text-ink-dim"><Loader2 className="size-4 animate-spin" /> Cargando productos…</p>
        ) : isError ? (
          <p className="mt-8 font-body text-sm text-ink-dim">No se pudieron cargar los productos. Intente de nuevo en unos minutos.</p>
        ) : productos.length === 0 ? (
          <p className="mt-8 font-body text-sm text-ink-dim">No se encontraron productos.</p>
        ) : (
          <>
            <p role="status" className="mt-5 font-body text-xs text-ink-dim">{productos.length} {productos.length === 1 ? "producto" : "productos"}</p>
            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {productos.map((p) => {
                const ficha = fichaEditorial(p.node.title);
                const img = p.node.images.edges[0]?.node;
                const precio = p.node.priceRange.minVariantPrice;
                return (
                  <article key={p.node.id} className="flex min-w-0 flex-col overflow-hidden rounded-md border border-clinical-border bg-panel shadow-sm">
                    <Link to="/producto/$handle" params={{ handle: p.node.handle }} className="relative block border-b border-clinical-border">
                      {img && <img src={img.url} alt={img.altText ?? p.node.title} width={1000} height={750} loading="lazy" className="aspect-[4/3] w-full object-contain p-6" />}
                      {ficha && <span className="absolute left-3 top-3 rounded-sm bg-panel-soft px-2 py-1 font-body text-[10px] font-semibold text-primary">{ficha.uso}</span>}
                    </Link>
                    <div className="flex flex-1 flex-col p-5">
                      <p className="font-body text-xs font-semibold text-primary">{p.node.vendor} · {p.node.productType}</p>
                      <h2 className="mt-2 font-display text-xl font-bold leading-7 text-ink"><Link to="/producto/$handle" params={{ handle: p.node.handle }} className="hover:underline">{p.node.title}</Link></h2>
                      <p className="mt-2 font-body text-lg font-bold text-ink">{formatoPrecio(precio.amount, precio.currencyCode)}</p>
                      <p className="mt-2 flex-1 font-body text-sm leading-6 text-ink-dim">{ficha?.descripcion ?? p.node.description}</p>
                      <Button className="mt-5 w-full" onClick={() => agregar(p)} disabled={agregando}>
                        {agregando ? <Loader2 className="size-4 animate-spin" /> : <><ShoppingCart aria-hidden="true" /> Agregar al carrito</>}
                      </Button>
                      {ficha && <a href={ficha.fuente} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 font-body text-xs text-primary underline underline-offset-4">Ficha del fabricante <ExternalLink aria-hidden="true" className="size-3" /></a>}
                      {ficha && <p className="mt-2 font-body text-[10px] text-ink-dim">Fotografía: {ficha.fotoFuente}</p>}
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
        <p className="mt-8 border-l-2 border-brand-lime pl-4 font-body text-sm leading-6 text-ink-dim">Consulte con su profesional de salud antes de elegir un dispositivo. Los equipos hospitalarios y de laboratorio requieren personal capacitado; confirme compatibilidad, requisitos de uso y disponibilidad en Colombia.</p>
      </div>
    </section>
  );
}
