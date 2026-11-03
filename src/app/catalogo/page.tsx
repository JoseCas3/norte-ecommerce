import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Products, ProductSkeleton } from "@/components/products";
export const metadata = { title: "Daily gear" };
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
          <p className="eyebrow">
            <span className="live-dot" /> NORTE / DAILY GEAR
          </p>
          <h1>
            Fuera de lo
            <br />
            ordinario<span>.</span>
          </h1>
          <p className="hero-copy">
            Dale otra energía a tu rutina.
            <br />
            Accesorios, ideas y objetos que siguen tu ritmo.
          </p>
          <div className="hero-actions">
            <a className="button" href="#coleccion">
              Explorar el catálogo <span>↗</span>
            </a>
            <span className="drop-tag">
              DROP 001
              <br />
              <strong>Hecho para tu día.</strong>
            </span>
          </div>
        </div>
        <div className="hero-stage" aria-label="Selección de accesorios NORTE">
          <div className="stage-grid" aria-hidden="true" />
          <div className="stage-label">
            <span>ENCUENTRA TU FRECUENCIA</span>
            <span>01 / 06</span>
          </div>
          <span className="stage-word" aria-hidden="true">
            PLAY.
          </span>
          <Image
            src="/products/headphones.svg"
            alt="Ilustración de los Audífonos Studio"
            width={420}
            height={340}
            priority
            className="hero-headphones"
          />
          <div className="stage-product">
            <span>AUDÍFONOS STUDIO</span>
            <strong>Diseño que se escucha.</strong>
          </div>
          <span className="stage-sticker" aria-hidden="true">
            GOOD
            <br />
            EVERY
            <br />
            DAY ↗
          </span>
          <div className="stage-mini" aria-hidden="true">
            <Image src="/products/bottle.svg" alt="" width={95} height={95} />
            <div>
              <small>EL SIGUIENTE ESENCIAL</small>
              <strong>Siempre en movimiento.</strong>
            </div>
            <span>↗</span>
          </div>
        </div>
      </section>
      <section className="benefits" aria-label="Ventajas de compra">
        {[
          ["01", "Elige a tu manera", "Objetos útiles. Cero complicaciones."],
          ["02", "Envío incluido", "Sin costo de envío en tus pedidos."],
          [
            "03",
            "Compra con confianza",
            "Pagos protegidos a través de Stripe.",
          ],
        ].map(([n, title, copy]) => (
          <div key={n}>
            <span className="benefit-number">{n}</span>
            <p>
              <strong>{title}</strong>
              <span>{copy}</span>
            </p>
          </div>
        ))}
      </section>
      <section className="collection" id="coleccion">
        <div className="section-heading">
          <div>
            <p className="eyebrow">OBJETOS PARA SEGUIR TU RITMO</p>
            <h2>
              Tu próximo upgrade<span>↗</span>
            </h2>
          </div>
          <form className="search" action="/catalogo">
            <label className="sr-only" htmlFor="q">
              Buscar productos
            </label>
            <span aria-hidden="true">⌕</span>
            <input
              id="q"
              name="q"
              defaultValue={q}
              placeholder="¿Qué estás buscando?"
            />
            {category && (
              <input type="hidden" name="category" value={category} />
            )}
            <button aria-label="Buscar">→</button>
          </form>
        </div>
        <div className="catalog-shell">
          <aside className="catalog-sidebar">
            <p className="eyebrow">EXPLORAR POR</p>
            <nav aria-label="Categorías del catálogo" className="filters">
              {[
                ["", "Todo el catálogo"],
                ["Accesorios", "Accesorios"],
                ["Escritorio", "Escritorio"],
                ["Bienestar", "Bienestar"],
              ].map(([value, label], index) => (
                <Link
                  key={value}
                  aria-current={category === value ? "page" : undefined}
                  className={category === value ? "active" : ""}
                  href={`/catalogo?${new URLSearchParams({ ...(q ? { q } : {}), ...(value ? { category: value } : {}) })}`}
                >
                  <span>{label}</span>
                  <span aria-hidden="true">
                    {category === value ? "↗" : `0${index + 1}`}
                  </span>
                </Link>
              ))}
            </nav>
            <div className="sidebar-note">
              <span aria-hidden="true">✳</span>
              <h3>
                Menos scroll.
                <br />
                Más hallazgos.
              </h3>
              <p>Una selección pequeña para elegir mejor.</p>
            </div>
          </aside>
          <div className="catalog-results">
            <div className="results-topline">
              <span>
                {q
                  ? `Resultados para “${q}”`
                  : category || "La selección completa"}
              </span>
              <span>Diseño + funcionalidad</span>
            </div>
            <Suspense key={q + category} fallback={<ProductSkeleton />}>
              <Products query={q} category={category} />
            </Suspense>
          </div>
        </div>
      </section>
      <section className="editorial">
        <div>
          <p className="eyebrow">COSAS QUE SUMAN</p>
          <h2>
            Tu rutina merece
            <br />
            un giro inesperado.
          </h2>
          <p>
            Elige algo que se sienta tuyo. Nosotros nos encargamos del resto.
          </p>
        </div>
        <a
          href="#coleccion"
          className="editorial-arrow"
          aria-label="Volver al catálogo"
        >
          ↗
        </a>
        <span className="editorial-graphic" aria-hidden="true">
          ✳
        </span>
      </section>
    </>
  );
}
