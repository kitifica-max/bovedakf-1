"use client";

import { signOut } from "next-auth/react";
import { LogOutIcon } from "@/components/icons";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      aria-label="Cerrar sesión"
      className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-full text-kf-tinta-suave transition hover:bg-kf-carmesi/10 hover:text-kf-carmesi"
    >
      <LogOutIcon className="h-4 w-4" />
    </button>
  );
}
