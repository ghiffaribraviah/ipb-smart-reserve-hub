import { RoleShellPreview } from "../../components/layout/RoleShellPreview";
import { shellFixtures } from "../../fixtures/layoutShells";

export function LayoutShellsPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#111827]">
      <div className="mx-auto w-[1200px] max-w-[95%] py-12 pb-20 max-md:w-full max-md:max-w-full max-md:px-4 max-md:py-7 max-md:pb-14">
        <p className="mb-8 font-serif text-[34px] font-bold leading-none text-[#1d7667] max-md:text-[32px]">
          IPB SRH
        </p>
        <h1 className="mb-2 text-[32px] font-bold leading-tight text-slate-950 max-md:text-[28px]">
          Layout Shells
        </h1>
        <p className="m-0 text-sm leading-6 text-slate-500">
          Standalone reference for shared header, footer, student/staff/super-admin
          shell variants, and auth layout.
        </p>

        <div className="mt-7 grid gap-7">
          {shellFixtures.map((shell) => (
            <RoleShellPreview key={shell.role} shell={shell} />
          ))}

          <section className="overflow-hidden rounded-[14px] border border-[#e5e7eb] bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between gap-4 border-b border-[#e5e7eb] px-[22px] py-[18px]">
              <h2 className="text-base font-bold text-slate-950">Auth Layout</h2>
              <p className="m-0 text-sm text-slate-500">login/register frame</p>
            </div>
            <div className="grid min-h-[300px] grid-cols-2 max-md:grid-cols-1">
              <div className="flex items-center justify-center bg-gradient-to-br from-[#d1fae5] to-[#fef3c7] font-serif text-5xl font-bold text-[#1d7667] max-md:min-h-40">
                IPB SRH
              </div>
              <div className="flex flex-col gap-3.5 p-[34px] max-md:p-6 max-md:px-[18px]">
                <h2 className="m-0 text-2xl font-bold text-slate-950">Masuk</h2>
                <p className="m-0 text-sm leading-6 text-slate-500">
                  Gunakan akun IPB Smart Reserve Hub.
                </p>
                <div className="h-[46px] rounded-lg border border-[#e5e7eb] bg-[#f9fafb]" />
                <div className="h-[46px] rounded-lg border border-[#e5e7eb] bg-[#f9fafb]" />
                <button
                  className="h-[46px] rounded-lg border-0 bg-[#0f9d58] text-sm font-bold text-white"
                  type="button"
                >
                  Masuk
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
