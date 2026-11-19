/** BACKEND (cliente) · Acceso a la Storefront API de Shopify: productos y carrito real. */
import { toast } from "sonner";

const SHOPIFY_API_VERSION = "2026-10";
const SHOPIFY_STORE_PERMANENT_DOMAIN = "helthia-lcpc8-2q1nqh2h.myshopify.com";
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
// Token público de Storefront (solo lectura de catálogo y carrito).
const SHOPIFY_STOREFRONT_TOKEN = "18ca583a76e29c72b9b9280edcd77955";

export interface ShopifyProduct {
  node: {
    id: string;
    title: string;
    description: string;
    handle: string;
    vendor: string;
    productType: string;
    tags: string[];
    priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
    images: { edges: Array<{ node: { url: string; altText: string | null } }> };
    variants: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          price: { amount: string; currencyCode: string };
          availableForSale: boolean;
          selectedOptions: Array<{ name: string; value: string }>;
        };
      }>;
    };
    options: Array<{ name: string; values: string[] }>;
  };
}

const PRODUCT_FIELDS = `
  id title description handle vendor productType tags
  priceRange { minVariantPrice { amount currencyCode } }
  images(first: 5) { edges { node { url altText } } }
  variants(first: 10) { edges { node { id title price { amount currencyCode } availableForSale selectedOptions { name value } } } }
  options { name values }
`;

export const PRODUCTS_QUERY = `query GetProducts($first: Int!, $query: String) { products(first: $first, query: $query) { edges { node { ${PRODUCT_FIELDS} } } } }`;
export const PRODUCT_BY_HANDLE_QUERY = `query GetProduct($handle: String!) { product(handle: $handle) { ${PRODUCT_FIELDS} } }`;

export async function storefrontApiRequest(query: string, variables: Record<string, unknown> = {}) {
  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN },
    body: JSON.stringify({ query, variables }),
  });
  if (response.status === 402) {
    if (typeof window !== "undefined") toast.error("Shopify: se requiere un plan activo", { description: "La tienda necesita un plan de Shopify para usar el carrito. Visite https://admin.shopify.com." });
    return;
  }
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const data = await response.json();
  if (data.errors) throw new Error(`Error calling Shopify: ${data.errors.map((e: { message: string }) => e.message).join(", ")}`);
  return data;
}

export async function obtenerProductos(first = 50): Promise<ShopifyProduct[]> {
  const data = await storefrontApiRequest(PRODUCTS_QUERY, { first });
  return data?.data?.products?.edges ?? [];
}

export async function obtenerProducto(handle: string): Promise<ShopifyProduct | null> {
  const data = await storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY, { handle });
  const node = data?.data?.product;
  return node ? { node } : null;
}

/** Formato de precio en pesos colombianos. */
export function formatoPrecio(amount: string, currencyCode: string) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: currencyCode || "COP", maximumFractionDigits: 0 }).format(Number(amount));
}

// ---------- Carrito ----------
export const CART_QUERY = `query cart($id: ID!) { cart(id: $id) { id totalQuantity } }`;
const LINES = `lines(first: 100) { edges { node { id merchandise { ... on ProductVariant { id } } } } }`;
const CART_CREATE_MUTATION = `mutation cartCreate($input: CartInput!) { cartCreate(input: $input) { cart { id checkoutUrl ${LINES} } userErrors { field message } } }`;
const CART_LINES_ADD_MUTATION = `mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) { cartLinesAdd(cartId: $cartId, lines: $lines) { cart { id ${LINES} } userErrors { field message } } }`;
const CART_LINES_UPDATE_MUTATION = `mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) { cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { id } userErrors { field message } } }`;
const CART_LINES_REMOVE_MUTATION = `mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) { cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { id } userErrors { field message } } }`;

type UserError = { field: string[] | null; message: string };

function formatCheckoutUrl(checkoutUrl: string) {
  try {
    const url = new URL(checkoutUrl);
    url.searchParams.set("channel", "online_store");
    return url.toString();
  } catch {
    return checkoutUrl;
  }
}

function isCartNotFoundError(userErrors: UserError[]) {
  return userErrors.some((e) => e.message.toLowerCase().includes("cart not found") || e.message.toLowerCase().includes("does not exist"));
}

export async function createShopifyCart(variantId: string, quantity: number) {
  const data = await storefrontApiRequest(CART_CREATE_MUTATION, { input: { lines: [{ quantity, merchandiseId: variantId }] } });
  if (data?.data?.cartCreate?.userErrors?.length > 0) {
    console.error("Cart creation failed:", data.data.cartCreate.userErrors);
    return null;
  }
  const cart = data?.data?.cartCreate?.cart;
  const lineId = cart?.lines?.edges?.[0]?.node?.id;
  if (!cart?.checkoutUrl || !lineId) return null;
  return { cartId: cart.id as string, checkoutUrl: formatCheckoutUrl(cart.checkoutUrl), lineId: lineId as string };
}

export async function addLineToShopifyCart(cartId: string, variantId: string, quantity: number) {
  const data = await storefrontApiRequest(CART_LINES_ADD_MUTATION, { cartId, lines: [{ quantity, merchandiseId: variantId }] });
  const userErrors: UserError[] = data?.data?.cartLinesAdd?.userErrors || [];
  if (isCartNotFoundError(userErrors)) return { success: false, cartNotFound: true };
  if (userErrors.length > 0 || !data) return { success: false };
  const lines = data?.data?.cartLinesAdd?.cart?.lines?.edges || [];
  const newLine = lines.find((l: { node: { id: string; merchandise: { id: string } } }) => l.node.merchandise.id === variantId);
  return { success: true, lineId: newLine?.node?.id as string | undefined };
}

export async function updateShopifyCartLine(cartId: string, lineId: string, quantity: number) {
  const data = await storefrontApiRequest(CART_LINES_UPDATE_MUTATION, { cartId, lines: [{ id: lineId, quantity }] });
  const userErrors: UserError[] = data?.data?.cartLinesUpdate?.userErrors || [];
  if (isCartNotFoundError(userErrors)) return { success: false, cartNotFound: true };
  return { success: userErrors.length === 0 && !!data };
}

export async function removeLineFromShopifyCart(cartId: string, lineId: string) {
  const data = await storefrontApiRequest(CART_LINES_REMOVE_MUTATION, { cartId, lineIds: [lineId] });
  const userErrors: UserError[] = data?.data?.cartLinesRemove?.userErrors || [];
  if (isCartNotFoundError(userErrors)) return { success: false, cartNotFound: true };
  return { success: userErrors.length === 0 && !!data };
}
