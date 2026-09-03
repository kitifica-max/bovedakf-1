"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { acceptInviteAction } from "@/app/dashboard/actions";

export function AcceptForm({ token }: { token: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function accept() {
    setPending(true);
    setError(null);
    const result = await acceptInviteAction(token);
    if (result.ok) {
      router.push(`/dashboard/${result.vaultId}`);
      return;
    }
    setPending(false);
    setError(result.error);
  }

  return (
    <div className="mt-5">
      {error && (
        <p role="alert" className="mb-2 rounded-xl bg-danger/10 px-3 py-2 text-danger">{error}</p>
      )}
      <button
        onClick={accept}
        disabled={pending}
        className="w-full cursor-pointer rounded-full bg-ink px-4 py-3 font-medium text-gray transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Uniéndote..." : "Aceptar y entrar"}
      </button>
    </div>
  );
}
