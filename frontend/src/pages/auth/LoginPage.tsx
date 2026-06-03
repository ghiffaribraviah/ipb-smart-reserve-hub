import { Lock, Mail } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ApiError } from "../../api/http";
import { getRoleLanding, getSafeRedirectTarget, useAuth } from "../../auth/session";
import { AuthField } from "../../components/auth/AuthField";
import { AuthLayout } from "../../components/auth/AuthLayout";
import logo from "../../assets/logo.png";

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdminHelp, setShowAdminHelp] = useState(false);
  const showRegisterSuccess = searchParams.get("registered") === "1";
  const showExpiredSession = searchParams.get("reason") === "expired";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const user = await auth.login(email, password);
      navigate(getSafeRedirectTarget(searchParams.get("redirect"), getRoleLanding(user.role)), { replace: true });
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.message : "Gagal masuk. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <div className="mb-12 text-center max-md:mb-6 max-md:border-b max-md:border-[#E2E8F0] max-md:pb-5">
        <img
          src={logo}
          alt="IPB Smart Reserve Hub"
          className="mx-auto mb-2 h-24 w-auto"
        />
        <div className="text-xl font-semibold text-[#2D3748]">IPB Smart Reserve Hub</div>
      </div>

      <h2 className="mb-2 text-2xl font-bold text-[#2D3748]">Masuk</h2>
      <p className="mb-8 text-sm leading-6 text-[#718096]">
        Masukkan kredensial untuk mengakses dashboard fasilitas Anda.
      </p>
      {showRegisterSuccess ? (
        <div className="mb-5 rounded-lg border border-[#bbf7d0] bg-[#ecfdf5] px-4 py-3 text-sm font-semibold text-[#065f46]">
          Akun berhasil dibuat. Silakan masuk menggunakan email kampus Anda.
        </div>
      ) : null}
      {showExpiredSession ? (
        <div className="mb-5 rounded-lg border border-[#bfdbfe] bg-[#eff6ff] px-4 py-3 text-sm font-semibold text-[#1e40af]">
          Sesi Anda berakhir. Masuk kembali untuk melanjutkan.
        </div>
      ) : null}
      {error ? (
        <div className="mb-5 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm font-semibold text-[#991b1b]">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit}>
        <AuthField
          autoComplete="email"
          icon={<Mail aria-hidden="true" size={18} />}
          id="login-email"
          label="Email Kampus"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="name@apps.ipb.ac.id"
          required
          type="email"
          value={email}
        />

        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-semibold text-[#2D3748]" htmlFor="login-password">
            Kata Sandi
          </label>
          <button
            className="text-sm font-medium text-[#0A9361] no-underline hover:underline"
            onClick={() => setShowAdminHelp(true)}
            type="button"
          >
            Hubungi admin
          </button>
        </div>
        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 flex -translate-y-1/2 text-[#718096]">
            <Lock aria-hidden="true" size={18} />
          </span>
          <input
            autoComplete="current-password"
            className="h-[43px] w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] py-3 pl-10 pr-4 text-sm text-[#2D3748] outline-none transition focus:border-[#0A9361] focus:bg-white focus:ring-2 focus:ring-[#0A9361]/10 max-md:h-12"
            id="login-password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            required
            type="password"
            value={password}
          />
        </div>

        <button
          className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-lg border-0 bg-[#0A9361] p-3.5 text-base font-semibold text-white shadow-none transition hover:bg-[#087a50] disabled:cursor-not-allowed disabled:bg-[#94a3b8] max-md:min-h-[52px]"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Memproses" : "Masuk"} <span aria-hidden="true">→</span>
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-[#718096]">
        Belum punya akun?{" "}
        <Link className="font-semibold text-[#0A9361] no-underline" to="/register">
          Daftar di sini
        </Link>
      </div>

      {showAdminHelp ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4"
          onClick={() => setShowAdminHelp(false)}
        >
          <section
            aria-modal="true"
            aria-label="Hubungi admin"
            role="dialog"
            className="w-full max-w-[520px] rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-[0_24px_48px_rgba(15,23,42,0.18)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#E2E8F0] pb-4">
              <div>
                <h2 className="m-0 text-xl font-bold text-[#2D3748]">Hubungi admin</h2>
                <p className="m-0 mt-1 text-sm text-[#718096]">Pesan bantuan untuk tugas ini.</p>
              </div>
              <button
                aria-label="Tutup bantuan admin"
                className="text-sm font-semibold text-[#0A9361] hover:underline"
                onClick={() => setShowAdminHelp(false)}
                type="button"
              >
                Tutup
              </button>
            </div>
            <p className="m-0 mt-5 text-sm leading-6 text-[#2D3748]">
              reach out @fasya/@bravi/@daffakautsar/@salman from @ilkomerz60 at instagram :)
            </p>
          </section>
        </div>
      ) : null}
    </AuthLayout>
  );
}
