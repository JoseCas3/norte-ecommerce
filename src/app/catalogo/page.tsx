import { Suspense } from "react";
import Link from "next/link";
import { Products, ProductSkeleton } from "@/components/products";
export const metadata = { title: "Colección" };
export default async function Catalog({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q = "", category = "" } = await searchParams;
  return (
    <>
      <section className="hero">
        <div>
          <p className="eyebrow">OBJETOS CON PROPÓSITO / COLECCIÓN 01</p>
          <h1>
            Tu día a día.
            <br />
            <em>Un poco mejor.</em>
          </h1>
          <p className="hero-copy">
            Diseño que se siente bien. Objetos que usas de verdad.
            <br />
            Descubre una selección hecha para acompañarte.
          </p>
          <a href="#coleccion" className="button">
            Encuentra tu próximo esencial <span>↓</span>
          </a>
          <div className="hero-note">
            <span>◇</span> Elegidos con intención. Hechos para durar.
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <span className="art-caption">THE EVERYDAY EDIT</span>
          <div className="orbit" />
          <div className="bottle">
            <div className="bottle-cap" />
            <span>
              N<br />O<br />R<br />T<br />E
            </span>
          </div>
          <div className="notebook">
            <span>
              IDEAS
              <br />
              QUE VAN
              <br />
              CONTIGO.
            </span>
            <small>NORTE — 01</small>
          </div>
          <span className="art-bottom">
            BUEN DISEÑO. TODOS LOS DÍAS. <span>↗</span>
          </span>
        </div>
      </section>
      <section className="benefits">
        <span>◇ Diseño funcional</span>
        <span>↗ Envíos sin costo</span>
        <span>⊞ Pagos protegidos con Stripe</span>
        <span>◎ Tu cuenta, tus pedidos</span>
      </section>
      <section className="collection" id="coleccion">
        <div className="section-heading">
          <div>
            <span className="eyebrow">MENOS RUIDO, MÁS ESENCIA</span>
            <h2>
              Encuentra lo tuyo<span>.</span>
            </h2>
          </div>
          <form className="search" action="/catalogo">
            <label className="sr-only" htmlFor="q">
              Buscar productos
            </label>
            <input
              id="q"
              name="q"
              defaultValue={q}
              placeholder="Buscar en la colección…"
            />
            <button aria-label="Buscar">↗</button>
          </form>
        </div>
        <div className="filters">
          {[
            ["", "Todos los objetos"],
            ["Accesorios", "Accesorios"],
            ["Escritorio", "Escritorio"],
            ["Bienestar", "Bienestar"],
          ].map(([value, label]) => (
            <Link
              key={value}
              className={category === value ? "active" : ""}
              href={`/catalogo?${new URLSearchParams({ ...(q ? { q } : {}), ...(value ? { category: value } : {}) })}`}
            >
              {label}
            </Link>
          ))}
          <span>Una selección para vivir mejor</span>
        </div>
        <Suspense key={q + category} fallback={<ProductSkeleton />}>
          <Products query={q} category={category} />
        </Suspense>
      </section>
      <section className="editorial">
        <p className="eyebrow">LA FILOSOFÍA NORTE</p>
        <h2>
          No necesitas más.
          <br />
          Necesitas <em>lo que va contigo.</em>
        </h2>
        <p>
          Objetos honestos, funcionales y con carácter.
          <br />
          Pequeñas elecciones que hacen un gran día.
        </p>
      </section>
    </>
  );
}
