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
        <span className="auth-symbol" aria-hidden="true">
          ↗
        </span>
        <p className="eyebrow">TU CUENTA NORTE</p>
        <h1>Vuelve a tu ritmo.</h1>
        <p>Entra para seguir con tu compra y consultar tus pedidos.</p>
      </div>
      <div className="auth-box">
        <h2>Inicia sesión</h2>
        {expired && (
          <p className="notice">Tu sesión expiró. Inicia sesión de nuevo.</p>
        )}
        <AuthForm kind="login" />
      </div>
      <p className="auth-footnote">Tu próxima buena elección empieza aquí.</p>
    </section>
  );
}
