import { Suspense } from "react";
import Link from "next/link";
import { api, requireUser } from "@/lib/api";
import { money, type Order } from "@/lib/types";
import { ResumePayment } from "@/components/resume-payment";
import { refreshOrders } from "../actions";
export const metadata = { title: "Mis pedidos" };
async function Orders() {
  const { data } = await api<{ data: Order[] }>("/orders", { auth: true });
  if (!data.length)
    return (
      <div className="empty">
        <h2>Aquí comienza tu historia.</h2>
        <p>Todavía no has hecho ningún pedido.</p>
        <Link className="button" href="/catalogo">
          Descubrir la colección
        </Link>
      </div>
    );
  return (
    <div className="orders">
      {data.map((o) => (
        <article className="order" key={o.id}>
          <div className="order-top">
            <div>
              <span className="eyebrow">PEDIDO #{o.id}</span>
              <h2>
                {new Date(o.created_at).toLocaleDateString("es-GT", {
                  timeZone: "America/Guatemala",
                  dateStyle: "long",
                })}
              </h2>
            </div>
            <span className={`badge ${o.status}`}>
              {o.status === "paid"
                ? "Pago confirmado"
                : o.status === "cancelled"
                  ? "Pago expirado"
                  : "Pendiente de pago"}
            </span>
          </div>
          {o.items.map((i) => (
            <div className="summary-line" key={i.product_id}>
              <span>
                {i.name} × {i.quantity}
              </span>
              <span>{money(i.unit_price * i.quantity)}</span>
            </div>
          ))}
          <div className="order-bottom">
            <strong>Total {money(o.total)}</strong>
            {o.status === "pending" && <ResumePayment id={o.id} />}
          </div>
        </article>
      ))}
    </div>
  );
}
export default async function History() {
  const user = await requireUser();
  return (
    <section className="page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">TU ESPACIO / {user.name}</p>
          <h1>
            Mis pedidos<span>.</span>
          </h1>
        </div>
        <form action={refreshOrders}>
          <button className="button secondary">Actualizar estado ↻</button>
        </form>
      </div>
      <Suspense fallback={<p role="status">Consultando tus pedidos…</p>}>
        <Orders />
      </Suspense>
    </section>
  );
}
