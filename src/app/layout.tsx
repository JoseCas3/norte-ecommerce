import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { CartProvider, CartLink } from "@/components/cart";
import { Vitals } from "@/components/vitals";
import { logout } from "./actions";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "NORTE — Objetos para tu día a día",
    template: "%s | NORTE",
  },
  description:
    "Una selección de objetos útiles, diseño esencial y compras seguras.",
};
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authenticated = !!(await cookies()).get("norte_token");
  return (
    <html lang="es">
      <body>
        <CartProvider>
          <a className="skip" href="#contenido">
            Saltar al contenido
          </a>
          <div className="topbar">
            Menos cosas. Mejores elecciones.{" "}
            <span>Envío gratis en todos los pedidos ↗</span>
          </div>
          <header>
            <Link className="brand" href="/">
              NORTE<span>®</span>
            </Link>
            <nav aria-label="Navegación principal">
              <Link href="/catalogo">Colección</Link>
              <Link href="/historial">Mis pedidos</Link>
            </nav>
            <div className="header-actions">
              {authenticated ? (
                <form action={logout}>
                  <button className="text-button">Cerrar sesión</button>
                </form>
              ) : (
                <Link href="/login">Mi cuenta</Link>
              )}
              <CartLink />
            </div>
          </header>
          <main id="contenido">{children}</main>
          <footer>
            <div>
              <Link href="/" className="brand">
                NORTE<span>®</span>
              </Link>
              <p>Lo esencial, bien elegido.</p>
            </div>
            <p>
              Diseño cotidiano. Compra segura.
              <br />
              <small>Next.js · Laravel · Stripe</small>
            </p>
            <Link href="/catalogo">Explorar la colección ↗</Link>
          </footer>
          <Vitals />
        </CartProvider>
      </body>
    </html>
  );
}
