import { Checkout } from "@/components/cart";
import { cookies } from "next/headers";
export const metadata = { title: "Tu carrito" };
export default async function Page() {
  return (
    <section className="page">
      <p className="eyebrow">01 CARRITO — 02 PAGO — 03 A DISFRUTAR</p>
      <h1>
        Buenas elecciones<span>.</span>
      </h1>
      <Checkout authenticated={!!(await cookies()).get("norte_token")} />
    </section>
  );
}
