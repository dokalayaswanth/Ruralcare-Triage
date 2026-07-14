import Link from "next/link";

export function Navbar() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold text-slate-900">
          RuralCare Triage
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/intake" className="text-slate-700 hover:text-slate-950">
            Intake
          </Link>
          <Link
            href="/specialist"
            className="text-slate-700 hover:text-slate-950"
          >
            Specialist Dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}