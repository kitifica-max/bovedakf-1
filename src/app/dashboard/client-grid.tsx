import Link from "next/link";
import { clientColor } from "@/lib/platforms";
import { NewClientForm } from "./new-client-form";

export type ClientCard = { id: string; name: string; color: string | null; accounts: number; owned: boolean };

// Canvas client cards: one color pair per client, condensed uppercase name, account count.
export function ClientGrid({
  clients,
  selectedId,
  openNew = false,
  className = "",
}: {
  clients: ClientCard[];
  selectedId?: string;
  openNew?: boolean;
  className?: string;
}) {
  return (
    <ul data-stagger className={`grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-4 ${className}`}>
      {clients.map((c) => {
        const { bg, ink, text } = clientColor(c.color);
        const selected = c.id === selectedId;
        return (
          <li key={c.id}>
            <Link
              href={`/dashboard/${c.id}`}
              aria-current={selected ? "page" : undefined}
              style={{ background: bg, color: ink, outlineColor: selected ? text : undefined }}
              className={`flex min-h-45 flex-col justify-between gap-4 rounded-[32px] p-6 no-underline transition hover:-translate-y-0.5 ${
                selected ? "outline-4 outline-offset-[3px] outline-solid" : ""
              }`}
            >
              <span className="font-brand text-[34px] leading-[1.04] font-extrabold break-words uppercase">{c.name}</span>
              <span className="text-[13px] font-bold">
                {c.accounts} cuenta{c.accounts === 1 ? "" : "s"}
                {!c.owned && " · compartido"}
              </span>
            </Link>
          </li>
        );
      })}
      <li>
        {/* Keyed so the header's "?nuevo=1" link reopens it on the same page. */}
        <NewClientForm key={String(openNew)} defaultOpen={openNew} />
      </li>
    </ul>
  );
}
