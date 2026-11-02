import { ProductSkeleton } from "@/components/products";
export default function Loading() {
  return (
    <section className="page">
      <p className="eyebrow">COLECCIÓN NORTE</p>
      <h1>Preparando tu selección…</h1>
      <ProductSkeleton />
    </section>
  );
}
