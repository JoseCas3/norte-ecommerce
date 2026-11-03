import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { CartProvider, CartLink } from "@/components/cart";
import { Vitals } from "@/components/vitals";
import { logout } from "./actions";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "NORTE — Daily gear",
    template: "%s | NORTE",
  },
  description:
    "Dale otra energía a tu rutina. Accesorios, escritorio y bienestar con compra segura.",
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
            DAILY GEAR / EXTRAORDINARY DAYS{" "}
            <span>ENVÍO INCLUIDO EN CADA PEDIDO ↗</span>
          </div>
          <header>
            <Link className="brand" href="/">
              NORTE<span>DAILY GEAR</span>
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
                NORTE<span>DAILY GEAR</span>
              </Link>
              <p>Fuera de lo ordinario.</p>
            </div>
            <p>
              Tu rutina. Tu ritmo. Tu NORTE.
              <br />
              <small>Diseño + funcionalidad</small>
            </p>
            <Link href="/catalogo">Volver al catálogo ↗</Link>
          </footer>
          <Vitals />
        </CartProvider>
      </body>
    </html>
  );
}
