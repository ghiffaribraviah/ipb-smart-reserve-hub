import type { ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
  maxWidth?: string;
};

export function AuthLayout({ children, maxWidth = "420px" }: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-white text-[#2D3748] md:flex">
      <section className="relative flex min-h-screen flex-1 flex-col items-center justify-center overflow-hidden bg-white px-8 py-8 max-md:block max-md:bg-[#F8FAFC] max-md:px-5 max-md:pb-6 max-md:pt-[132px]">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 hidden h-[230px] bg-[linear-gradient(135deg,rgba(6,78,59,0.92),rgba(10,147,97,0.72),rgba(217,180,93,0.48))] max-md:block"
        >
          <div className="mx-auto mt-2 h-[220px] w-[88%] rounded-[18px] border-4 border-white/10 bg-white/5" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[#1d7667] opacity-45">
            <div className="font-serif text-2xl font-extrabold">IPB SRH</div>
            <div className="text-xs">Deterministic media fixture</div>
          </div>
        </div>
        <div
          className="relative z-10 w-full max-md:rounded-xl max-md:bg-white max-md:px-5 max-md:pb-6 max-md:pt-7 max-md:shadow-[0_18px_45px_rgba(15,23,42,0.12)]"
          style={{ maxWidth }}
        >
          {children}
        </div>
        <footer className="relative z-10 mt-8 w-full text-center text-xs text-[#718096] max-md:mt-[22px] max-md:px-2">
          © 2026 IPB Smart Reserve Hub.
          <div className="mt-1 flex items-center justify-center gap-2 max-md:hidden">
            <a className="text-[#718096] no-underline" href="#">
              Protokol Keamanan
            </a>
            <span>-</span>
            <a className="text-[#718096] no-underline" href="#">
              Ketentuan Akses
            </a>
          </div>
        </footer>
      </section>
      <section
        aria-label="Ilustrasi kampus IPB"
        className="hidden flex-1 items-center justify-center bg-[linear-gradient(135deg,rgba(6,78,59,0.22),rgba(217,180,93,0.24)),linear-gradient(135deg,#b7dcc7,#f6e7a5)] md:flex"
      >
        <div className="text-center">
          <div className="font-serif text-[82px] font-extrabold leading-none text-[#1d7667]">
            IPB SRH
          </div>
          <p className="mt-9 text-[36px] text-slate-600">Deterministic media fixture</p>
        </div>
      </section>
    </main>
  );
}
