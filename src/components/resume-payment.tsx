"use client";
import { useActionState } from "react";
import { resumePayment } from "@/app/actions";
export function ResumePayment({ id }: { id: number }) {
  const [state, action, pending] = useActionState(resumePayment, {});
  return (
    <form action={action}>
      <input type="hidden" name="order" value={id} />
      <button className="button secondary" disabled={pending}>
        {pending ? "Conectando…" : "Retomar pago ↗"}
      </button>
      {state.error && (
        <p role="alert" className="notice error">
          {state.error}
        </p>
      )}
    </form>
  );
}
