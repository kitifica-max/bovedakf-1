"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { acceptInviteAction } from "@/app/dashboard/actions";
import { CTAButton } from "@/components/site/cta-button";

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
      <CTAButton type="button" onClick={accept} disabled={pending} className="mt-2 w-full">
        {pending ? "Uniéndote..." : "Aceptar y entrar"}
      </CTAButton>
    </div>
  );
}
