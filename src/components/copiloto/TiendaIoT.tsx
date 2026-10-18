/** FRONTEND · Tienda editorial con fotografías reales y enlaces a proveedores. */
import { useState } from "react";
import { ArrowUpRight, ExternalLink, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { productosIoT } from "@/lib/copiloto/productos-iot";

export function TiendaIoT() {
  const [proveedor, setProveedor] = useState("Todos");
  const proveedores = ["Todos", ...new Set(productosIoT.map((producto) => producto.proveedor))];
  const productos = productosIoT.filter((producto) => proveedor === "Todos" || producto.proveedor === proveedor);

  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <p className="flex items-center gap-2 font-body text-xs font-bold uppercase text-primary"><ShoppingBag className="size-4" aria-hidden="true" /> Tecnología médica conectada</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-ink sm:text-5xl">Tienda HelthIA</h1>
        <p className="mt-4 max-w-2xl font-body leading-7 text-ink-dim">Dispositivos para seguir su salud en casa y equipos para profesionales, con fotografías reales y acceso a sus proveedores.</p>
        <p className="mt-3 max-w-3xl font-body text-xs leading-5 text-ink-dim">Las compras, precios, disponibilidad y envíos se consultan con cada proveedor. HelthIA no vende estos equipos ni recibe sus mediciones automáticamente. No existe una alianza comercial anunciada con las marcas.</p>

        <div role="group" aria-label="Filtrar por proveedor" className="mt-8 flex flex-wrap gap-2 border-y border-clinical-border py-4">
          {proveedores.map((nombre) => (
            <Button key={nombre} size="sm" variant={proveedor === nombre ? "default" : "outline"} aria-pressed={proveedor === nombre} onClick={() => setProveedor(nombre)}>{nombre}</Button>
          ))}
        </div>
        <p role="status" className="mt-5 font-body text-xs text-ink-dim">{productos.length} {productos.length === 1 ? "producto" : "productos"}</p>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {productos.map((producto) => (
            <article key={producto.nombre} className="flex min-w-0 flex-col overflow-hidden rounded-md border border-clinical-border bg-panel shadow-sm">
              <div className="relative border-b border-clinical-border">
                <img src={producto.imagen} alt={producto.nombre + " · " + producto.marca} width={1000} height={750} loading="lazy" className="aspect-[4/3] w-full object-contain p-6" />
                <span className="absolute left-3 top-3 rounded-sm bg-panel-soft px-2 py-1 font-body text-[10px] font-semibold text-primary">{producto.uso}</span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <p className="font-body text-xs font-semibold text-primary">{producto.marca} · {producto.categoria}</p>
                <h2 className="mt-2 font-display text-xl font-bold leading-7 text-ink">{producto.nombre}</h2>
                <p className="mt-3 flex-1 font-body text-sm leading-6 text-ink-dim">{producto.descripcion}</p>
                {producto.nota && <p className="mt-3 font-body text-xs leading-5 text-ink-dim">{producto.nota}</p>}
                <Button asChild className="mt-5 w-full"><a href={producto.enlace} target="_blank" rel="noopener noreferrer">{producto.accion}<ArrowUpRight aria-hidden="true" /></a></Button>
                <a href={producto.fuente} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 font-body text-xs text-primary underline underline-offset-4">Ficha del fabricante <ExternalLink aria-hidden="true" className="size-3" /></a>
                <p className="mt-2 font-body text-[10px] text-ink-dim">Fotografía: {producto.fotoFuente}</p>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-8 border-l-2 border-brand-lime pl-4 font-body text-sm leading-6 text-ink-dim">Consulte con su profesional de salud antes de elegir un dispositivo. Los equipos hospitalarios y de laboratorio requieren personal capacitado; confirme compatibilidad, requisitos de uso y disponibilidad en Colombia con el proveedor.</p>
      </div>
    </section>
  );
}
