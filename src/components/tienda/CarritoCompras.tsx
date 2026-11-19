/** FRONTEND · Carrito lateral; el pago se hace en el checkout seguro de Shopify. */
import { useEffect, useState } from "react";
import { ShoppingCart, Minus, Plus, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCartStore } from "@/stores/cartStore";
import { formatoPrecio } from "@/lib/shopify/storefront";

export function CarritoCompras() {
  const [abierto, setAbierto] = useState(false);
  const { items, isLoading, isSyncing, updateQuantity, removeItem, getCheckoutUrl, syncCart } = useCartStore();
  const total = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrecio = items.reduce((s, i) => s + Number(i.price.amount) * i.quantity, 0);
  const moneda = items[0]?.price.currencyCode || "COP";

  useEffect(() => { if (abierto) syncCart(); }, [abierto, syncCart]);

  const pagar = () => {
    const url = getCheckoutUrl();
    if (url) { window.open(url, "_blank"); setAbierto(false); }
  };

  return (
    <Sheet open={abierto} onOpenChange={setAbierto}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative" aria-label={`Carrito, ${total} productos`}>
          <ShoppingCart className="size-5" aria-hidden="true" /> Carrito
          {total > 0 && <span className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-primary font-body text-[10px] font-bold text-primary-foreground">{total}</span>}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex h-full w-full flex-col sm:max-w-lg">
        <SheetHeader className="shrink-0">
          <SheetTitle className="font-display">Carrito de compras</SheetTitle>
          <SheetDescription>{total === 0 ? "Su carrito está vacío" : `${total} ${total === 1 ? "producto" : "productos"} en el carrito`}</SheetDescription>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col pt-4">
          {items.length === 0 ? (
            <div className="flex flex-1 items-center justify-center text-center font-body text-sm text-ink-dim">
              <div><ShoppingCart className="mx-auto mb-3 size-10" aria-hidden="true" />Agregue dispositivos desde la tienda.</div>
            </div>
          ) : (
            <>
              <ul className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                {items.map((item) => {
                  const img = item.product.node.images?.edges?.[0]?.node;
                  return (
                    <li key={item.variantId} className="flex gap-3 rounded-md border border-clinical-border p-2">
                      <div className="size-16 shrink-0 overflow-hidden rounded-sm bg-panel-soft">{img && <img src={img.url} alt={item.product.node.title} className="size-full object-contain" />}</div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-body text-sm font-semibold text-ink">{item.product.node.title}</p>
                        <p className="font-body text-sm font-bold text-primary">{formatoPrecio(item.price.amount, item.price.currencyCode)}</p>
                        <div className="mt-1 flex items-center gap-1">
                          <Button variant="outline" size="icon" className="size-7" aria-label="Quitar uno" onClick={() => updateQuantity(item.variantId, item.quantity - 1)}><Minus className="size-3" /></Button>
                          <span className="w-8 text-center font-body text-sm">{item.quantity}</span>
                          <Button variant="outline" size="icon" className="size-7" aria-label="Agregar uno" onClick={() => updateQuantity(item.variantId, item.quantity + 1)}><Plus className="size-3" /></Button>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="size-7 shrink-0" aria-label="Eliminar del carrito" onClick={() => removeItem(item.variantId)}><Trash2 className="size-4" /></Button>
                    </li>
                  );
                })}
              </ul>
              <div className="shrink-0 space-y-3 border-t border-clinical-border pt-4">
                <div className="flex items-center justify-between font-body">
                  <span className="font-semibold text-ink">Total</span>
                  <span className="text-lg font-bold text-ink">{formatoPrecio(String(totalPrecio), moneda)}</span>
                </div>
                <Button onClick={pagar} className="w-full" size="lg" disabled={isLoading || isSyncing}>
                  {isLoading || isSyncing ? <Loader2 className="size-4 animate-spin" /> : <><ExternalLink className="size-4" /> Pagar con Shopify</>}
                </Button>
                <p className="font-body text-[11px] leading-4 text-ink-dim">Precios de referencia en pesos colombianos. Consulte a su profesional de salud antes de comprar un dispositivo.</p>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
