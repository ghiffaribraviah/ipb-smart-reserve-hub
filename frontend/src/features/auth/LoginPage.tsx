import { ArrowRight, Lock, Mail } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import { ApiError } from '../../shared/api';
import { authSession } from '../../shared/auth';
import { getCurrentUser, getRoleLandingPath, login } from './api';

type FormErrors = {
  email?: string;
  password?: string;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (typeof error.detail === 'string') {
      return error.detail;
    }

    return error.message;
  }

  return 'Unable to sign in. Please try again.';
}

function validate(email: string, password: string): FormErrors {
  const errors: FormErrors = {};
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    errors.email = 'Email address is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  }

  return errors;
}

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(() => Boolean(authSession.getAccessToken()));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isBusy = isCheckingSession || isSubmitting;
  const fieldErrorId = useMemo(
    () => ({
      email: errors.email ? 'login-email-error' : undefined,
      password: errors.password ? 'login-password-error' : undefined,
    }),
    [errors.email, errors.password],
  );

  useEffect(() => {
    if (!authSession.getAccessToken()) {
      return;
    }

    let isActive = true;

    async function verifyStoredSession() {
      try {
        const currentUser = await getCurrentUser();

        if (isActive) {
          navigate(getRoleLandingPath(currentUser.role), { replace: true, state: { currentUser } });
        }
      } catch {
        authSession.clearAccessToken();

        if (isActive) {
          setIsCheckingSession(false);
        }
      }
    }

    void verifyStoredSession();

    return () => {
      isActive = false;
    };
  }, [navigate]);

  function clearFieldState() {
    if (formError) {
      setFormError(null);
    }

    if (Object.keys(errors).length > 0) {
      setErrors({});
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate(email, password);
    setErrors(nextErrors);
    setFormError(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const session = await login({ email: email.trim(), password });
      authSession.setAccessToken(session.access_token);
      const currentUser = await getCurrentUser();
      navigate(getRoleLandingPath(currentUser.role), { replace: true, state: { currentUser } });
    } catch (error) {
      authSession.clearAccessToken();
      setFormError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-surface-container-lowest text-primary">
      <div className="grid min-h-screen lg:grid-cols-[55fr_45fr]">
        <section className="flex min-h-screen flex-col px-6 py-10 sm:px-10 lg:px-20">
          <div className="mx-auto flex w-full max-w-[750px] flex-1 flex-col">
            <div className="flex flex-1 flex-col justify-center py-8">
              <div className="mb-14 text-center">
                <p className="font-serif text-[64px] font-bold leading-[0.82] text-secondary sm:text-[88px]">
                  <span className="block text-[#57bd8b]">IPB</span>
                  <span className="block text-[#009688]">SRH</span>
                </p>
                <h1 className="mt-5 text-4xl font-bold tracking-normal text-primary">IPB Smart Reserve Hub</h1>
              </div>

              <form className="w-full" noValidate onSubmit={handleSubmit}>
                <fieldset disabled={isBusy} className="space-y-6 disabled:opacity-70">
                  <div>
                    <h2 className="text-2xl font-bold text-primary">Sign In</h2>
                    <p className="mt-2 max-w-sm text-base leading-6 text-on-surface-variant">
                      Enter your credentials to access your facility dashboard.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-on-surface-variant" htmlFor="login-email">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail
                        aria-hidden="true"
                        className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-outline"
                      />
                      <input
                        aria-describedby={fieldErrorId.email}
                        aria-invalid={Boolean(errors.email)}
                        autoComplete="email"
                        className="h-12 w-full rounded-xl border border-outline bg-surface-container-lowest pl-12 pr-4 text-base outline-none transition focus:border-secondary focus:ring-4 focus:ring-secondary/15"
                        id="login-email"
                        name="email"
                        onChange={(event) => {
                          setEmail(event.target.value);
                          clearFieldState();
                        }}
                        placeholder="name@university.edu"
                        type="email"
                        value={email}
                      />
                    </div>
                    {errors.email ? (
                      <p className="text-sm font-medium text-error" id="login-email-error">
                        {errors.email}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-on-surface-variant" htmlFor="login-password">
                      Password
                    </label>
                    <div className="relative">
                      <Lock
                        aria-hidden="true"
                        className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-outline"
                      />
                      <input
                        aria-describedby={fieldErrorId.password}
                        aria-invalid={Boolean(errors.password)}
                        autoComplete="current-password"
                        className="h-12 w-full rounded-xl border border-outline bg-surface-container-lowest pl-12 pr-4 text-base outline-none transition focus:border-secondary focus:ring-4 focus:ring-secondary/15"
                        id="login-password"
                        name="password"
                        onChange={(event) => {
                          setPassword(event.target.value);
                          clearFieldState();
                        }}
                        placeholder="••••••••"
                        type="password"
                        value={password}
                      />
                    </div>
                    {errors.password ? (
                      <p className="text-sm font-medium text-error" id="login-password-error">
                        {errors.password}
                      </p>
                    ) : null}
                  </div>

                  {formError ? (
                    <div className="rounded-xl border border-error/25 bg-error-container px-4 py-3 text-sm font-semibold text-on-error-container">
                      {formError}
                    </div>
                  ) : null}

                  <button
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#07996f] px-5 text-base font-bold text-white transition hover:bg-secondary focus:outline-none focus:ring-4 focus:ring-secondary/20 disabled:cursor-not-allowed"
                    type="submit"
                  >
                    {isSubmitting ? 'Signing in...' : 'Sign In'}
                    {!isSubmitting ? <ArrowRight aria-hidden="true" className="size-5" /> : null}
                  </button>
                </fieldset>
              </form>
            </div>

            <footer className="pb-4 text-center text-xs font-medium text-outline">
              <p>© 2026 IPB Smart Reserve Hub.</p>
              <p className="mt-2">
                Security Protocol <span className="mx-4">·</span> Terms of Access
              </p>
            </footer>
          </div>
        </section>

        <aside
          aria-label="Campus building image placeholder"
          className="relative hidden min-h-screen overflow-hidden bg-primary-container lg:block"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,245,189,0.24),transparent_34%),linear-gradient(140deg,#c8e9e8_0%,#466463_42%,#0f2e2e_100%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/25 to-transparent" />
        </aside>
      </div>
    </main>
  );
}
