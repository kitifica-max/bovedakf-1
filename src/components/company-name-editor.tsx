"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { updateCompanyNameAction } from "@/app/dashboard/actions";
import { CheckIcon, PencilIcon } from "@/components/icons";

export function CompanyNameEditor({ initialName }: { initialName: string }) {
  const { data: session, update } = useSession();
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const name = session?.user?.companyName || initialName;

  async function save(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await updateCompanyNameAction(formData);
    setPending(false);
    if (result) {
      setError(result);
      return;
    }
    await update({ companyName: formData.get("companyName") });
    setEditing(false);
  }

  if (editing) {
    return (
      <form action={save} className="flex items-center gap-1.5">
        <label htmlFor="companyName" className="sr-only">Nombre de la empresa</label>
        <input
          id="companyName"
          name="companyName"
          defaultValue={name}
          required
          maxLength={120}
          autoFocus
          disabled={pending}
          className="w-40 rounded-full border border-gray/25 bg-transparent px-3 py-1 text-base text-gray outline-none focus:border-gray/60 sm:w-52 sm:text-sm"
          onKeyDown={(e) => {
            if (e.key === "Escape") setEditing(false);
          }}
        />
        <button
          type="submit"
          disabled={pending}
          aria-label="Guardar"
          className="grid h-7 w-7 shrink-0 cursor-pointer place-items-center rounded-full text-gray/70 transition hover:bg-gray/10 hover:text-gray disabled:opacity-50"
        >
          <CheckIcon aria-hidden="true" className="h-3.5 w-3.5" />
        </button>
        {error && <p role="alert" className="text-xs text-danger">{error}</p>}
      </form>
    );
  }

  return (
    <button
      type="button"
      className="hidden cursor-pointer items-center gap-1.5 text-gray/70 transition hover:text-gray sm:flex"
      onClick={() => setEditing(true)}
    >
      {name}
      <PencilIcon aria-hidden="true" className="h-3.5 w-3.5" />
    </button>
  );
}
