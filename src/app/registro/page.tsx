import { AuthForm } from "@/components/auth-form";
export const metadata = { title: "Crear cuenta" };
export default function Register() {
  return (
    <section className="auth-layout">
      <div className="auth-story">
        <span className="auth-symbol" aria-hidden="true">
          ✳
        </span>
        <p className="eyebrow">ÚNETE A NORTE</p>
        <h1>Hazlo tuyo.</h1>
        <p>Una cuenta para comprar, guardar tus pedidos y seguir su estado.</p>
      </div>
      <div className="auth-box">
        <h2>Crea tu cuenta</h2>
        <AuthForm kind="register" />
      </div>
      <p className="auth-footnote">Buen diseño. A tu manera.</p>
    </section>
  );
}
