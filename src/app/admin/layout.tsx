// Admin pages share the platform's light brand tokens (see .kf-app in globals.css).
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="kf-app flex min-h-dvh flex-col">{children}</div>;
}
