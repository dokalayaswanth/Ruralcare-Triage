import Link from "next/link";

export default function NotFoundPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-20 text-center">
      <div className="rounded-2xl border bg-white p-10 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Page not found
        </p>

        <h1 className="mt-3 text-3xl font-bold text-slate-950">
          This page does not exist
        </h1>

        <p className="mt-3 text-slate-600">
          The record or page you are looking for may have been moved, deleted,
          or entered incorrectly.
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/"
            className="rounded-lg bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800"
          >
            Go Home
          </Link>

          <Link
            href="/specialist"
            className="rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
          >
            Specialist Dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}