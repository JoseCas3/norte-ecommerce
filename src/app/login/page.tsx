import { AuthForm } from "@/components/auth-form";
export const metadata = { title: "Iniciar sesión" };
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ expired?: string }>;
}) {
  const { expired } = await searchParams;
  return (
    <section className="auth-layout">
      <div className="auth-story">
        <p className="eyebrow">TU ESPACIO NORTE</p>
        <h1>
          Qué bueno
          <br />
          verte de nuevo<span>.</span>
        </h1>
        <p>Tus favoritos, tus pedidos y todo lo que va contigo.</p>
        <span className="auth-mark" aria-hidden="true">
          N↗
        </span>
      </div>
      <div className="auth-box">
        <span className="eyebrow">CONTINÚA DONDE LO DEJASTE</span>
        <h2>Inicia sesión</h2>
        {expired && (
          <p className="notice">Tu sesión expiró. Inicia sesión de nuevo.</p>
        )}
        <AuthForm kind="login" />
      </div>
    </section>
  );
}
