import { Hash, Lock, Mail, Phone, User } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ApiError, apiRequest } from "../../api/http";
import { AuthField } from "../../components/auth/AuthField";
import { AuthLayout } from "../../components/auth/AuthLayout";

type RegisterForm = {
  confirmPassword: string;
  email: string;
  fullName: string;
  nim: string;
  password: string;
  phone: string;
};

type RegisterErrors = Partial<Record<keyof RegisterForm | "form", string>>;

const initialForm: RegisterForm = {
  confirmPassword: "",
  email: "",
  fullName: "",
  nim: "",
  password: "",
  phone: "",
};

export function RegisterPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const showError = searchParams.get("fixture") === "error";

  function updateField(field: keyof RegisterForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  }

  function validateForm() {
    const nextErrors: RegisterErrors = {};

    if (!form.fullName.trim()) nextErrors.fullName = "Nama lengkap wajib diisi.";
    if (!form.nim.trim()) nextErrors.nim = "NIM wajib diisi.";
    if (!form.phone.trim()) nextErrors.phone = "Nomor telepon wajib diisi.";
    if (!form.email.trim()) {
      nextErrors.email = "Email kampus wajib diisi.";
    } else if (!form.email.endsWith("@apps.ipb.ac.id")) {
      nextErrors.email = "Gunakan email aktif dengan domain @apps.ipb.ac.id.";
    }
    if (form.password.length < 8) {
      nextErrors.password = "Kata sandi minimal 8 karakter.";
    }
    if (!form.confirmPassword) {
      nextErrors.confirmPassword = "Konfirmasi kata sandi wajib diisi.";
    } else if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = "Konfirmasi kata sandi tidak sama.";
    }

    return nextErrors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateForm();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      await apiRequest("/auth/register", {
        body: {
          email: form.email,
          full_name: form.fullName,
          nim: form.nim,
          password: form.password,
          phone: form.phone,
        },
        method: "POST",
      });
      navigate("/login?registered=1", { replace: true });
    } catch (caughtError) {
      setErrors({
        form:
          caughtError instanceof ApiError
            ? caughtError.message
            : "Gagal terhubung ke server. Coba lagi.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout maxWidth="520px">
      <div className="mb-8 text-center max-md:mb-6 max-md:border-b max-md:border-[#E2E8F0] max-md:pb-5">
        <h1 className="mb-2 font-serif text-5xl font-extrabold leading-[1.1] tracking-[1px] text-[#0A9361]">
          IPB
          <br />
          SRH
        </h1>
        <div className="text-xl font-semibold text-[#2D3748]">IPB Smart Reserve Hub</div>
      </div>

      <h2 className="mb-2 text-2xl font-bold text-[#2D3748]">Daftar Akun</h2>
      <p className="mb-6 text-sm leading-6 text-[#718096]">
        Buat akun untuk mengelola peminjaman fasilitas kampus.
      </p>
      {showError ? (
        <div className="mb-5 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm font-semibold text-[#991b1b]">
          Email kampus sudah terdaftar atau domain email tidak valid.
        </div>
      ) : null}
      {errors.form ? (
        <div className="mb-5 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm font-semibold text-[#991b1b]">
          {errors.form}
        </div>
      ) : null}

      <form className="grid gap-5" onSubmit={handleSubmit}>
        <fieldset className="m-0 grid gap-4 rounded-xl border border-[#e5e7eb] bg-white p-4 max-md:p-3.5">
          <legend className="px-1 text-sm font-bold text-[#2D3748]">Data Identitas</legend>
          <AuthField
            autoComplete="name"
            error={errors.fullName}
            icon={<User aria-hidden="true" size={18} />}
            id="register-name"
            label="Nama Lengkap"
            onChange={(event) => updateField("fullName", event.target.value)}
            placeholder="Masukkan nama lengkap"
            type="text"
            value={form.fullName}
          />

          <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1 max-md:gap-0">
            <AuthField
              error={errors.nim}
              icon={<Hash aria-hidden="true" size={18} />}
              id="register-nim"
              label="NIM"
              onChange={(event) => updateField("nim", event.target.value)}
              placeholder="Contoh: G64..."
              type="text"
              value={form.nim}
            />
            <AuthField
              autoComplete="email"
              error={errors.email ?? (showError ? "Gunakan email aktif dengan domain @apps.ipb.ac.id." : undefined)}
              icon={<Mail aria-hidden="true" size={18} />}
              id="register-email"
              label="Email Kampus"
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="@apps.ipb.ac.id"
              type="email"
              value={form.email}
            />
          </div>

          <AuthField
            autoComplete="tel"
            error={errors.phone}
            icon={<Phone aria-hidden="true" size={18} />}
            id="register-phone"
            label="Nomor Telepon"
            onChange={(event) => updateField("phone", event.target.value)}
            placeholder="Contoh: 081234567890"
            type="tel"
            value={form.phone}
          />
        </fieldset>

        <fieldset className="m-0 grid gap-4 rounded-xl border border-[#e5e7eb] bg-white p-4 max-md:p-3.5">
          <legend className="px-1 text-sm font-bold text-[#2D3748]">Buat Kata Sandi</legend>
          <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1 max-md:gap-0">
            <AuthField
              autoComplete="new-password"
              error={errors.password}
              icon={<Lock aria-hidden="true" size={18} />}
              id="register-password"
              label="Kata Sandi"
              onChange={(event) => updateField("password", event.target.value)}
              placeholder="••••••••"
              type="password"
              value={form.password}
            />
            <AuthField
              autoComplete="new-password"
              error={errors.confirmPassword}
              icon={<Lock aria-hidden="true" size={18} />}
              id="register-confirm-password"
              label="Konfirmasi Kata Sandi"
              onChange={(event) => updateField("confirmPassword", event.target.value)}
              placeholder="••••••••"
              type="password"
              value={form.confirmPassword}
            />
          </div>
        </fieldset>

        <button
          className="mt-0.5 flex min-h-[46px] w-full items-center justify-center gap-2 rounded-lg border-0 bg-[#0A9361] p-3.5 text-base font-semibold text-white shadow-none transition hover:bg-[#087a50] disabled:cursor-not-allowed disabled:bg-[#94a3b8] max-md:mt-2 max-md:min-h-[52px]"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Memproses" : "Buat Akun"} <span aria-hidden="true">→</span>
        </button>
      </form>

      <div className="mt-8 pb-2 text-center text-sm text-[#718096]">
        Sudah punya akun?{" "}
        <Link className="font-semibold text-[#0A9361] no-underline" to="/login">
          Masuk di sini
        </Link>
      </div>
    </AuthLayout>
  );
}
