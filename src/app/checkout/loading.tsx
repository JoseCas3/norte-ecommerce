export default function Loading() {
  return (
    <section className="page" aria-busy="true">
      <h1>Preparando tu carrito…</h1>
      <div className="skeleton" style={{ height: 320 }} />
    </section>
  );
}
