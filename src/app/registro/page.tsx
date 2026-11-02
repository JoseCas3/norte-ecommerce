import { AuthForm } from "@/components/auth-form";
export const metadata = { title: "Crear cuenta" };
export default function Register() {
  return (
    <section className="auth-layout">
      <div className="auth-story">
        <p className="eyebrow">BIENVENIDO A NORTE</p>
        <h1>
          Buenas elecciones.
          <br />
          Desde el inicio<span>.</span>
        </h1>
        <p>Crea tu cuenta y lleva el control de cada compra.</p>
        <span className="auth-mark" aria-hidden="true">
          N↗
        </span>
      </div>
      <div className="auth-box">
        <span className="eyebrow">EMPIEZA AQUÍ</span>
        <h2>Crea tu cuenta</h2>
        <AuthForm kind="register" />
      </div>
    </section>
  );
}
