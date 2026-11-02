"use client";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="page empty">
      <span className="eyebrow">HAGAMOS OTRO INTENTO</span>
      <h1>No pudimos cargar esta sección.</h1>
      <p>Comprueba que la API esté disponible y vuelve a intentarlo.</p>
      <button className="button" onClick={reset}>
        Volver a intentar ↗
      </button>
    </section>
  );
}
