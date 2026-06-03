import type { ReactNode } from "react";
import authBg from "../../assets/auth-bg.png";

type AuthLayoutProps = {
  children: ReactNode;
  maxWidth?: string;
};

export function AuthLayout({ children, maxWidth = "420px" }: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-white text-[#2D3748] md:flex">
      <section className="relative flex min-h-screen flex-1 flex-col items-center justify-center overflow-y-auto overflow-x-hidden bg-white px-8 py-10 max-md:block max-md:bg-[#F8FAFC] max-md:px-5 max-md:pb-6 max-md:pt-[132px]">
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
        <footer className="relative z-10 mt-10 w-full shrink-0 text-center text-xs text-[#718096] max-md:mt-[22px] max-md:px-2">
          © 2026 IPB Smart Reserve Hub.
          <div className="mt-1 flex items-center justify-center gap-2 max-md:hidden">
            <span className="text-[#718096]">
              Protokol Keamanan
            </span>
            <span>-</span>
            <span className="text-[#718096]">
              Ketentuan Akses
            </span>
          </div>
        </footer>
      </section>
<section
  aria-label="Ilustrasi kampus IPB"
  className="relative hidden flex-1 overflow-hidden md:flex"
>
  {/* Background image */}
  <div
    className="absolute inset-0 bg-cover bg-center"
    style={{
      backgroundImage: `url(${authBg})`,
    }}
  />

  {/* Dark overlay */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20" />

  {/* Bottom-right text */}
  <div className="absolute bottom-12 right-12 z-10 max-w-[500px] text-right">
    <h2 className="font-serif text-7xl font-bold leading-[0.95] text-white">
      Smart
      <br />
      Reserve
      <br />
      Hub
    </h2>

    <p className="mt-5 text-sm leading-6 text-white/80">
      Platform terintegrasi untuk reservasi fasilitas kampus IPB University.
    </p>
  </div>
</section>
    </main>
  );
}
