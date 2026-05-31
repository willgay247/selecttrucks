"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/lib/admin-actions";

const initial: LoginState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(login, initial);

  return (
    <form action={action} className="mt-5 space-y-3">
      <input
        name="password"
        type="password"
        required
        autoFocus
        placeholder="Password"
        className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
      {state.error && <p className="text-sm font-medium text-sold">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-accent px-5 py-2.5 font-semibold text-white hover:bg-accent-bright disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
