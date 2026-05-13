import { CheckCircle2 } from "lucide-react";
import { visualHarnessFixture } from "../../fixtures/visualHarness";

export function SmokePage() {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-950 sm:px-8">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-emerald-700">
            IPB Smart Reserve Hub
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-3xl font-semibold text-slate-950 sm:text-4xl">
                {visualHarnessFixture.title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                {visualHarnessFixture.summary}
              </p>
            </div>
            <button
              className="inline-flex h-11 items-center justify-center rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              type="button"
            >
              Periksa Fixture
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-lg border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-lg font-semibold text-slate-950">
              Fixture deterministik
            </h2>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Fasilitas
                </dt>
                <dd className="mt-1 font-medium text-slate-900">
                  {visualHarnessFixture.sampleReservation.facility}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Waktu
                </dt>
                <dd className="mt-1 font-medium text-slate-900">
                  {visualHarnessFixture.sampleReservation.date},{" "}
                  {visualHarnessFixture.sampleReservation.time}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Status
                </dt>
                <dd className="mt-1">
                  <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {visualHarnessFixture.sampleReservation.status}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Seed
                </dt>
                <dd className="mt-1 font-medium text-slate-900">
                  Fixture seed: {visualHarnessFixture.seed}
                </dd>
              </div>
            </dl>
          </article>

          <aside className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-950">
              Pemeriksaan dasar
            </h2>
            <ul className="mt-4 space-y-3">
              {visualHarnessFixture.checks.map((check) => (
                <li className="flex gap-3 text-sm text-slate-700" key={check}>
                  <CheckCircle2
                    aria-hidden="true"
                    className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
                  />
                  <span>{check}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>
    </main>
  );
}
