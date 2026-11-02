import Link from "next/link";
export default function NotFound() {
  return (
    <section className="page empty">
      <p className="eyebrow">404 / CAMBIO DE RUMBO</p>
      <h1>Por aquí no era.</h1>
      <p>Ese producto o página no está disponible.</p>
      <Link className="button" href="/catalogo">
        Volver a la colección
      </Link>
    </section>
  );
}
