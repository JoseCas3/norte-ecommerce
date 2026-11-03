import Link from "next/link";
import { ProductArtwork } from "./product-artwork";
import { api } from "@/lib/api";
import { money, type Product } from "@/lib/types";
import { AddToCart } from "./cart";
export async function Products({
  query = "",
  category = "",
}: {
  query?: string;
  category?: string;
}) {
  const params = new URLSearchParams();
  if (query) params.set("search", query);
  if (category) params.set("category", category);
  const { data } = await api<{ data: Product[] }>(`/products?${params}`, {
    cache: true,
  });
  if (!data.length)
    return (
      <div className="empty">
        <h2>No encontramos productos.</h2>
        <p>Prueba otra búsqueda o explora todas las categorías.</p>
        <Link href="/catalogo">Ver todos los productos →</Link>
      </div>
    );
  return (
    <div className="product-grid">
      {data.map((p, index) => (
        <article className="product-card" key={p.id}>
          <Link
            href={`/catalogo/${p.id}`}
            aria-label={`${index === 0 ? "Destacado" : p.category}: Ver ${p.name} ↗`}
            className="product-art"
          >
            <span aria-hidden="true" className="product-label">
              {index === 0 ? "DESTACADO" : p.category}
            </span>
            <ProductArtwork icon={p.icon} />
            <span aria-hidden="true" className="product-arrow">
              ↗
            </span>
          </Link>
          <div className="product-info">
            <span className="eyebrow">{p.category}</span>
            <div className="product-title">
              <h2>
                <Link href={`/catalogo/${p.id}`}>{p.name}</Link>
              </h2>
              <strong>{money(p.price)}</strong>
            </div>
            <p>{p.description}</p>
            <AddToCart product={p} />
          </div>
        </article>
      ))}
    </div>
  );
}
export function ProductSkeleton() {
  return (
    <div
      className="product-grid"
      aria-busy="true"
      aria-label="Cargando catálogo"
    >
      {[1, 2, 3].map((n) => (
        <div className="skeleton-card" key={n}>
          <div className="skeleton" />
          <p className="skeleton line" />
          <p className="skeleton line short" />
        </div>
      ))}
    </div>
  );
}
