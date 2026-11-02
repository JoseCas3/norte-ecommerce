import Link from "next/link";
import { api, requireUser } from "@/lib/api";
import { type Order, money } from "@/lib/types";
import { ClearPurchasedCart } from "@/components/cart";
import { refreshOrders } from "../actions";
export const metadata = { title: "Estado de compra" };
export default async function Confirmation({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  await requireUser();
  const { order } = await searchParams;
  const id = Number(order);
  if (!Number.isSafeInteger(id) || id < 1)
    return (
      <section className="page empty">
        <h1>Consulta tu compra</h1>
        <Link href="/historial">Ir a mis pedidos →</Link>
      </section>
    );
  const data = await api<Order>(`/orders/${id}`, { auth: true });
  const paid = data.status === "paid";
  return (
    <section className="page empty">
      <span className="success-mark">{paid ? "✓" : "◷"}</span>
      <p className="eyebrow">PEDIDO #{data.id}</p>
      <h1>
        {paid ? "Lo elegiste. Ya es tuyo." : "Estamos confirmando tu pago."}
      </h1>
      <p>
        {paid
          ? `Tu pago de ${money(data.total)} está confirmado. Gracias por elegir NORTE.`
          : "Recibimos tu regreso de Stripe. El pago se mostrará confirmado cuando el servidor lo verifique."}
      </p>
      {paid ? (
        <ClearPurchasedCart purchased={data.items} />
      ) : (
        <form action={refreshOrders}>
          <button className="button">Consultar estado ↻</button>
        </form>
      )}
      <Link className="button secondary" href="/historial">
        Ver mis pedidos →
      </Link>
    </section>
  );
}
