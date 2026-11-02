"use client";
import { useActionState } from "react";
import Link from "next/link";
import { authenticate } from "@/app/actions";
export function AuthForm({ kind }: { kind: "login" | "register" }) {
  const [state, action, pending] = useActionState(
    authenticate.bind(null, kind),
    {},
  );
  const register = kind === "register";
  return (
    <form action={action} className="auth-form">
      {register && (
        <label>
          Nombre completo
          <input
            name="name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={100}
          />
        </label>
      )}
      <label>
        Correo electrónico
        <input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="tu@correo.com"
          required
        />
      </label>
      <label>
        Contraseña
        <input
          type="password"
          name="password"
          autoComplete={register ? "new-password" : "current-password"}
          required
          minLength={8}
          maxLength={128}
        />
      </label>
      {register && (
        <label>
          Confirmar contraseña
          <input
            type="password"
            name="password_confirmation"
            autoComplete="new-password"
            required
            minLength={8}
          />
        </label>
      )}
      {state.error && (
        <div className="notice error" role="alert">
          {state.error}
          {state.fields && (
            <ul>
              {Object.entries(state.fields).flatMap(([field, messages]) =>
                messages.map((m) => <li key={field + m}>{m}</li>),
              )}
            </ul>
          )}
        </div>
      )}
      <button className="button wide" disabled={pending}>
        {pending
          ? "Un momento…"
          : register
            ? "Crear mi cuenta →"
            : "Entrar a mi cuenta →"}
      </button>
      <p>
        {register ? "¿Ya tienes una cuenta?" : "¿Primera vez por aquí?"}{" "}
        <Link href={register ? "/login" : "/registro"}>
          {register ? "Inicia sesión" : "Crea tu cuenta"}
        </Link>
      </p>
    </form>
  );
}
