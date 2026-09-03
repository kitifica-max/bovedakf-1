import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ShieldCheckIcon, KeyRoundIcon, ActivityIcon } from "@/components/icons";

const trustPoints = [
  { Icon: KeyRoundIcon, text: "Encriptación AES-256-GCM real, no una promesa de marketing." },
  { Icon: ShieldCheckIcon, text: "Revocás cualquier link compartido al instante, cuando quieras." },
  { Icon: ActivityIcon, text: "Auditoría completa: quién entró, cuándo y desde dónde." },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center gap-6 p-4 sm:p-8">
      <div className="w-full max-w-5xl">
        <SiteHeader />
      </div>
      <main className="flex w-full max-w-5xl flex-1 items-center justify-center gap-16">
        <div className="hidden max-w-xs flex-col gap-7 lg:flex">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">
            Tu bóveda, cifrada de punta a punta
          </h2>
          <ul className="flex flex-col gap-5">
            {trustPoints.map(({ Icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-soft text-blue">
                  <Icon className="h-4 w-4" />
                </span>
                <p className="mt-1.5 text-sm text-ink-soft">{text}</p>
              </li>
            ))}
          </ul>
        </div>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
