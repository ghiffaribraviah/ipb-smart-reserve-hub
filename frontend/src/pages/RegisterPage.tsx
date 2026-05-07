import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiPost, type ApiError } from "../lib/api-client";

export function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [nim, setNim] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await apiPost("/auth/register", {
        email,
        password,
        full_name: fullName,
        nim,
        phone,
      });
      navigate("/login", {
        replace: true,
        state: { successMessage: "Registrasi berhasil! Silakan masuk dengan akun Anda." },
      });
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.detail ?? "Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-surface p-4">
      <div className="w-full max-w-md rounded-lg bg-surface-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-primary">
          Daftar Akun
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-text-secondary"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-border px-3 py-2 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-text-secondary"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-border px-3 py-2 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div>
            <label
              htmlFor="fullName"
              className="mb-1 block text-sm font-medium text-text-secondary"
            >
              Nama Lengkap
            </label>
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded border border-border px-3 py-2 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div>
            <label
              htmlFor="nim"
              className="mb-1 block text-sm font-medium text-text-secondary"
            >
              NIM
            </label>
            <input
              id="nim"
              type="text"
              required
              value={nim}
              onChange={(e) => setNim(e.target.value)}
              className="w-full rounded border border-border px-3 py-2 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="mb-1 block text-sm font-medium text-text-secondary"
            >
              Nomor Telepon
            </label>
            <input
              id="phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded border border-border px-3 py-2 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {error && (
            <div role="alert" className="rounded bg-error-bg px-3 py-2 text-sm text-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-accent py-3 font-semibold text-white hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-60"
          >
            {isSubmitting ? "Memproses..." : "Daftar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          Sudah punya akun?{" "}
          <Link to="/login" className="font-medium text-accent hover:text-accent-hover">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
