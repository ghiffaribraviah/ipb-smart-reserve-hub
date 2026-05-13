import { Hash, Lock, Mail, User } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { AuthField } from "../../components/auth/AuthField";
import { AuthLayout } from "../../components/auth/AuthLayout";

export function RegisterPage() {
  const [searchParams] = useSearchParams();
  const showError = searchParams.get("fixture") === "error";

  return (
    <AuthLayout maxWidth="480px">
      <div className="mb-12 text-center max-md:mb-6 max-md:border-b max-md:border-[#E2E8F0] max-md:pb-5">
        <h1 className="mb-2 font-serif text-5xl font-extrabold leading-[1.1] tracking-[1px] text-[#0A9361]">
          IPB
          <br />
          SRH
        </h1>
        <div className="text-xl font-semibold text-[#2D3748]">IPB Smart Reserve Hub</div>
      </div>

      <h2 className="mb-2 text-2xl font-bold text-[#2D3748]">Daftar Akun</h2>
      <p className="mb-8 text-sm leading-6 text-[#718096]">
        Buat akun untuk mengelola peminjaman fasilitas kampus.
      </p>
      {showError ? (
        <div className="mb-5 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm font-semibold text-[#991b1b]">
          Email kampus sudah terdaftar atau domain email tidak valid.
        </div>
      ) : null}

      <form>
        <AuthField
          autoComplete="name"
          icon={<User aria-hidden="true" size={18} />}
          id="register-name"
          label="Nama Lengkap"
          placeholder="Masukkan nama lengkap"
          type="text"
        />

        <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1 max-md:gap-0">
          <AuthField
            icon={<Hash aria-hidden="true" size={18} />}
            id="register-nim"
            label="NIM"
            placeholder="Contoh: G64..."
            type="text"
          />
          <AuthField
            autoComplete="email"
            error={showError ? "Gunakan email aktif dengan domain @apps.ipb.ac.id." : undefined}
            icon={<Mail aria-hidden="true" size={18} />}
            id="register-email"
            label="Email Kampus"
            placeholder="@apps.ipb.ac.id"
            type="email"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1 max-md:gap-0">
          <AuthField
            autoComplete="new-password"
            icon={<Lock aria-hidden="true" size={18} />}
            id="register-password"
            label="Kata Sandi"
            placeholder="••••••••"
            type="password"
          />
          <AuthField
            autoComplete="new-password"
            icon={<Lock aria-hidden="true" size={18} />}
            id="register-confirm-password"
            label="Surat Sandi"
            placeholder="••••••••"
            type="password"
          />
        </div>

        <button
          className="mt-0.5 flex min-h-[46px] w-full items-center justify-center gap-2 rounded-lg border-0 bg-[#0A9361] p-3.5 text-base font-semibold text-white shadow-none transition hover:bg-[#087a50] max-md:mt-2 max-md:min-h-[52px]"
          type="button"
        >
          Buat Akun <span aria-hidden="true">→</span>
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-[#718096]">
        Sudah punya akun?{" "}
        <Link className="font-semibold text-[#0A9361] no-underline" to="/login">
          Masuk di sini
        </Link>
      </div>
    </AuthLayout>
  );
}
