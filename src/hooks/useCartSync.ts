/** Limpia el carrito cuando el pedido se completó en Shopify (al volver a la pestaña). */
import { useEffect } from "react";
import { useCartStore } from "@/stores/cartStore";

export function useCartSync() {
  const syncCart = useCartStore((s) => s.syncCart);
  useEffect(() => {
    syncCart();
    const onVisible = () => { if (document.visibilityState === "visible") syncCart(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [syncCart]);
}
