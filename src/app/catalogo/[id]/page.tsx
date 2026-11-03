import Link from "next/link";
import { ProductArtwork } from "@/components/product-artwork";
import { notFound } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { money, type Product } from "@/lib/types";
import { AddToCart } from "@/components/cart";
export default async function Detail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  let p: Product;
  try {
    p = await api<Product>(`/products/${id}`, { cache: true });
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
  return (
    <section className="page">
      <Link className="back" href="/catalogo">
        ← Volver a la colección
      </Link>
      <div className="detail">
        <div className="detail-art" aria-hidden="true">
          <ProductArtwork icon={p.icon} />
        </div>
        <div>
          <span className="eyebrow">{p.category} / NORTE ORIGINAL</span>
          <h1>{p.name}</h1>
          <p className="detail-price">{money(p.price)}</p>
          <p>{p.description}</p>
          <p className="stock">
            {p.stock > 0
              ? `${p.stock} disponibles · Listo para acompañarte`
              : "Temporalmente agotado"}
          </p>
          <AddToCart product={p} />
          <div className="detail-notes">
            <p>↗ Envío sin costo</p>
            <p>◇ Pago protegido por Stripe</p>
            <p>◎ Consulta el estado en tu historial</p>
          </div>
        </div>
      </div>
    </section>
  );
}
