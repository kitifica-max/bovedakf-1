"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { signIn as passkeySignIn } from "next-auth/webauthn";
import { checkPasswordAction } from "../actions";
import { FingerprintIcon } from "@/components/icons";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [step, setStep] = useState<"password" | "totp">("password");
  const [creds, setCreds] = useState<{ email: string; password: string } | null>(null);
  const [hasPasskey, setHasPasskey] = useState(false);

  useEffect(() => {
    // Post-mount read of a browser-only API — no SSR value to sync against.
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (localStorage.getItem("boveda-has-passkey") === "1") setHasPasskey(true);
    } catch {}
  }, []);

  async function onPasskeyLogin() {
    setPending(true);
    setError(null);
    try {
      const result = await passkeySignIn("passkey", { redirect: false });
      if (result?.error) {
        setPending(false);
        setError("No se pudo verificar la passkey.");
        return;
      }
      router.push("/dashboard");
    } catch {
      setPending(false);
      setError("Tu navegador no soporta passkeys, o cancelaste la solicitud.");
    }
  }

  async function onSubmitPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));

    const check = await checkPasswordAction(formData);
    if (!check.ok) {
      setPending(false);
      setError("Email o contraseña incorrectos.");
      return;
    }

    if (check.totpRequired) {
      setCreds({ email, password });
      setStep("totp");
      setPending(false);
      return;
    }

    const result = await signIn("credentials", { email, password, redirect: false });
    setPending(false);
    if (result?.error) {
      setError("Email o contraseña incorrectos.");
      return;
    }
    router.push("/dashboard");
  }

  async function onSubmitTotp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!creds) return;
    setPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: creds.email,
      password: creds.password,
      totpCode: formData.get("code"),
      redirect: false,
    });

    setPending(false);
    if (result?.error) {
      setError("Código incorrecto.");
      return;
    }
    router.push("/dashboard");
  }

  if (step === "totp") {
    return (
      <div className="glass w-full max-w-sm rounded-2xl p-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">Verificación</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Ingresá el código de tu app de autenticación, o un código de respaldo.
        </p>
        <form onSubmit={onSubmitTotp} className="mt-6 flex flex-col gap-3" noValidate>
          <div>
            <label htmlFor="code" className="sr-only">Código</label>
            <input
              id="code"
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              autoFocus
              required
              maxLength={20}
              className="w-full rounded-2xl border border-border-soft bg-gray/40 px-4 py-3 text-center text-lg tracking-[0.3em] outline-none transition focus:border-ink"
            />
          </div>
          {error && (
            <p role="alert" className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
          )}
          <button
            disabled={pending}
            className="mt-2 cursor-pointer rounded-full bg-ink px-4 py-3 text-sm font-medium text-gray transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Verificando..." : "Verificar"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("password");
              setError(null);
            }}
            className="text-center text-sm text-ink-soft underline"
          >
            Volver
          </button>
        </form>
      </div>
    );
  }

  return (
      <div className="glass w-full max-w-sm rounded-2xl p-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">Entrar</h1>
        <p className="mt-1 text-sm text-ink-soft">Accede a tu bóveda de credenciales.</p>
        <form onSubmit={onSubmitPassword} className="mt-6 flex flex-col gap-3" noValidate>
          <div>
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="email@empresa.com"
              required
              className="w-full rounded-2xl border border-border-soft bg-gray/40 px-4 py-3 text-base sm:text-sm outline-none transition focus:border-ink"
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Contraseña"
              required
              className="w-full rounded-2xl border border-border-soft bg-gray/40 px-4 py-3 text-base sm:text-sm outline-none transition focus:border-ink"
            />
          </div>
          {error && (
            <p role="alert" className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
          )}
          <button
            disabled={pending}
            className="mt-2 cursor-pointer rounded-full bg-ink px-4 py-3 text-sm font-medium text-gray transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Entrando..." : "Entrar"}
          </button>
        </form>

        {hasPasskey && (
          <>
            <div className="mt-4 flex items-center gap-3 text-xs text-ink-soft">
              <span className="h-px flex-1 bg-border-soft" />
              o
              <span className="h-px flex-1 bg-border-soft" />
            </div>
            <button
              type="button"
              onClick={onPasskeyLogin}
              disabled={pending}
              className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-border-soft px-4 py-3 text-sm font-medium text-ink transition hover:bg-paper disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FingerprintIcon aria-hidden="true" className="h-4 w-4" />
              Entrar con tu huella, cara o PIN
            </button>
          </>
        )}

        <a href="/register" className="mt-5 block text-center text-sm text-ink-soft underline">
          Crear una bóveda nueva
        </a>
      </div>
  );
}
