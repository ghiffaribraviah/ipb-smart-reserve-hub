import { type FormEvent, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth-context";
import type { ApiError } from "../lib/api-client";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = (location.state as { successMessage?: string } | null)?.successMessage;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate("/student/facilities", { replace: true });
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
          Masuk
        </h1>

        {successMessage && (
          <div className="mb-4 rounded bg-accent/10 px-3 py-2 text-sm text-accent">
            {successMessage}
          </div>
        )}

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
            {isSubmitting ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          Belum punya akun?{" "}
          <Link to="/register" className="font-medium text-accent hover:text-accent-hover">
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
