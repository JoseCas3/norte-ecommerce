"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useActionState,
  useCallback,
} from "react";
import Link from "next/link";
import { pay } from "@/app/actions";
import { money, type Product, type CartItem } from "@/lib/types";
type CartContext = {
  items: CartItem[];
  ready: boolean;
  add: (p: Product) => void;
  change: (id: number, q: number) => void;
  clear: () => void;
};
const Context = createContext<CartContext | null>(null);
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("norte_cart") || "[]");
      if (Array.isArray(stored))
        setItems(
          stored.filter(
            (i) =>
              i?.product &&
              Number.isInteger(i.product.id) &&
              Number.isInteger(i.quantity) &&
              i.quantity > 0 &&
              i.quantity <= 20,
          ),
        );
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) localStorage.setItem("norte_cart", JSON.stringify(items));
  }, [items, ready]);
  const add = (p: Product) =>
    setItems((old) => {
      const found = old.find((i) => i.product.id === p.id);
      return found
        ? old.map((i) =>
            i.product.id === p.id
              ? { product: p, quantity: Math.min(i.quantity + 1, p.stock, 20) }
              : i,
          )
        : [...old, { product: p, quantity: 1 }];
    });
  const change = (id: number, q: number) =>
    setItems((old) =>
      q <= 0
        ? old.filter((i) => i.product.id !== id)
        : old.map((i) =>
            i.product.id === id
              ? { ...i, quantity: Math.min(q, i.product.stock, 20) }
              : i,
          ),
    );
  const clear = useCallback(() => setItems([]), []);
  return (
    <Context.Provider value={{ items, ready, add, change, clear }}>
      {children}
    </Context.Provider>
  );
}
export function useCart() {
  const cart = useContext(Context);
  if (!cart) throw new Error("Carrito no disponible.");
  return cart;
}
export function CartLink() {
  const { items } = useCart();
  return (
    <Link className="cart-link" href="/checkout">
      Carrito <span>{items.reduce((s, i) => s + i.quantity, 0)}</span>
    </Link>
  );
}
export function AddToCart({ product }: { product: Product }) {
  const { add, ready } = useCart();
  const [added, setAdded] = useState(false);
  return (
    <button
      className="button"
      disabled={!ready || product.stock < 1}
      onClick={() => {
        add(product);
        setAdded(true);
      }}
    >
      {!product.stock
        ? "Agotado"
        : added
          ? "Agregado · añadir otro +"
          : "Añadir al carrito +"}
    </button>
  );
}
export function Checkout({ authenticated }: { authenticated: boolean }) {
  const { items, ready, change } = useCart();
  const [state, action, pending] = useActionState(pay, {});
  const [key, setKey] = useState("");
  const signature = items.map((i) => `${i.product.id}:${i.quantity}`).join("|");
  useEffect(() => {
    let stored;
    try {
      stored = JSON.parse(sessionStorage.getItem("norte_attempt") || "null");
    } catch {}
    const next =
      stored?.signature === signature ? stored.key : crypto.randomUUID();
    setKey(next);
    sessionStorage.setItem(
      "norte_attempt",
      JSON.stringify({ signature, key: next }),
    );
  }, [signature]);
  if (!ready) return <p role="status">Cargando tu carrito…</p>;
  if (!items.length)
    return (
      <div className="empty">
        <span className="empty-icon">↗</span>
        <h2>Tu próxima elección está esperando.</h2>
        <p>Explora el catálogo y añade algo a tu día a día.</p>
        <Link href="/catalogo" className="button">
          Explorar productos
        </Link>
      </div>
    );
  const total = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  return (
    <div className="checkout-grid">
      <section aria-label="Productos del carrito">
        {items.map(({ product: p, quantity }) => (
          <article className="cart-row" key={p.id}>
            <div className="cart-art" style={{ background: p.color }}>
              {p.icon}
            </div>
            <div>
              <span className="eyebrow">{p.category}</span>
              <h2>{p.name}</h2>
              <p>{money(p.price)} por unidad</p>
              <div className="quantity">
                <button
                  disabled={pending}
                  aria-label={`Quitar una unidad de ${p.name}`}
                  onClick={() => change(p.id, quantity - 1)}
                >
                  −
                </button>
                <span>{quantity}</span>
                <button
                  disabled={pending || quantity >= p.stock || quantity >= 20}
                  aria-label={`Añadir una unidad de ${p.name}`}
                  onClick={() => change(p.id, quantity + 1)}
                >
                  +
                </button>
                <button
                  className="remove"
                  disabled={pending}
                  onClick={() => change(p.id, 0)}
                >
                  Eliminar
                </button>
              </div>
            </div>
            <strong>{money(p.price * quantity)}</strong>
          </article>
        ))}
        <p className="muted">
          El precio y la disponibilidad se verifican de nuevo en el servidor.
        </p>
      </section>
      <aside className="summary">
        <span className="eyebrow">UN PASO MÁS</span>
        <h2>Resumen del pedido</h2>
        <div className="summary-line">
          <span>Productos</span>
          <span>{money(total)}</span>
        </div>
        <div className="summary-line">
          <span>Envío</span>
          <span>Gratis</span>
        </div>
        <div className="summary-line total">
          <span>Total estimado</span>
          <strong>{money(total)}</strong>
        </div>
        {authenticated ? (
          <form action={action}>
            <input
              type="hidden"
              name="items"
              value={JSON.stringify(
                items.map((i) => ({
                  product_id: i.product.id,
                  quantity: i.quantity,
                })),
              )}
            />
            <input type="hidden" name="key" value={key} />
            {state.error && (
              <p className="notice error" role="alert">
                {state.error}
              </p>
            )}
            <button className="button wide" disabled={pending || !key}>
              {pending ? "Preparando pago…" : "Continuar a Stripe ↗"}
            </button>
          </form>
        ) : (
          <>
            <p>Inicia sesión para guardar tu pedido y continuar al pago.</p>
            <Link className="button wide" href="/login">
              Iniciar sesión para comprar
            </Link>
          </>
        )}
        <p className="secure">
          ◇ Pago seguro con Stripe
          <br />
          No almacenamos los datos de tu tarjeta.
        </p>
      </aside>
    </div>
  );
}
export function ClearPurchasedCart({
  purchased,
}: {
  purchased: { product_id: number; quantity: number }[];
}) {
  const { items, clear, ready } = useCart();
  const current = items
    .map((i) => i.product.id + ":" + i.quantity)
    .sort()
    .join("|");
  const paid = purchased
    .map((i) => i.product_id + ":" + i.quantity)
    .sort()
    .join("|");
  useEffect(() => {
    if (ready && current === paid) {
      clear();
      sessionStorage.removeItem("norte_attempt");
    }
  }, [ready, current, paid, clear]);
  return null;
}
