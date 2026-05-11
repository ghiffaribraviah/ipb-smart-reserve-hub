import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CheckCircle2, LockKeyhole, Mail, ShieldAlert } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation } from "react-router-dom";
import { z } from "zod";
import { Button } from "../../components/ui/Button";
import { FormField } from "../../components/ui/FormField";
import { PasswordField } from "../../components/ui/PasswordField";
import { ApiError } from "../../lib/apiClient";
import { useAuth } from "./authSession";
import { AuthLayout } from "./AuthLayout";

type LoginResponse = {
  access_token: string;
  token_type: string;
};

type PageMessage = {
  text: string;
  tone: "success" | "warning" | "error";
};

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email institusi wajib diisi.")
    .email("Masukkan format email yang valid.")
    .refine((value) => {
      const domain = value.toLowerCase().split("@").at(1);
      return domain === "apps.ipb.ac.id" || domain === "ipb.ac.id";
    }, "Gunakan email institusi IPB."),
  password: z.string().min(1, "Kata sandi wajib diisi."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { apiClient, establishSession } = useAuth();
  const location = useLocation();
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const redirectTarget = query.get("redirect");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  const firstInvalidFieldRef = useRef<HTMLInputElement | null>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setFocus,
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(loginSchema),
  });

  const pageMessage = getPageMessage(query, submitError);
  const registerHref = getRegisterHref(redirectTarget);

  useEffect(() => {
    document.title = "Masuk - IPB Smart Reserve Hub";
  }, []);

  useEffect(() => {
    if (submitError) {
      messageRef.current?.focus();
    }
  }, [submitError]);

  async function onSubmit(values: LoginFormValues) {
    setSubmitError(null);
    try {
      const response = await apiClient.request<LoginResponse>("/auth/login", {
        auth: false,
        body: values,
        method: "POST",
      });
      await establishSession(response.access_token, redirectTarget);
    } catch (error) {
      if (error instanceof ApiError) {
        setSubmitError(error.message);
        return;
      }
      setSubmitError("Login belum dapat diproses. Silakan coba lagi.");
    }
  }

  function onInvalid() {
    if (errors.email) {
      setFocus("email");
      return;
    }
    if (errors.password) {
      setFocus("password");
      return;
    }
    firstInvalidFieldRef.current?.focus();
  }

  return (
    <AuthLayout>
      <div className="w-full">
        <header className={["text-center", pageMessage ? "mb-md" : "mb-lg"].join(" ")}>
          <p className="text-[38px] font-bold leading-[1.03] text-secondary sm:text-[42px]">
            IPB
            <br />
            SRH
          </p>
          <p className="mt-xs text-h3 font-bold text-on-surface">IPB Smart Reserve Hub</p>
        </header>

        <div className={pageMessage ? "mb-sm" : "mb-md"}>
          <h1 className="text-h3 font-bold text-on-surface">Masuk</h1>
          <p className="mt-sm text-label-bold font-medium normal-case tracking-normal text-on-surface-variant">
            Masukkan kredensial Anda untuk mengakses dashboard fasilitas.
          </p>
        </div>

        <form aria-describedby={pageMessage ? "login-message" : undefined} className={["grid", pageMessage ? "gap-sm" : "gap-md"].join(" ")} noValidate onSubmit={handleSubmit(onSubmit, onInvalid)}>
          {pageMessage ? <LoginMessage message={pageMessage} ref={messageRef} /> : null}
          <FormField
            autoComplete="email"
            compact
            error={errors.email?.message}
            id="login-email"
            label="Email institusi"
            leadingIcon={<Mail aria-hidden="true" size={18} />}
            placeholder="nama@apps.ipb.ac.id"
            required
            type="email"
            {...register("email")}
          />
          <PasswordField
            autoComplete="current-password"
            compact
            error={errors.password?.message}
            id="login-password"
            label="Kata sandi"
            leadingIcon={<LockKeyhole aria-hidden="true" size={18} />}
            placeholder="••••••••"
            required
            {...register("password")}
          />
          <Button className="min-h-11 w-full" isLoading={isSubmitting} size="md" type="submit">
            Masuk ke Akun
            <ArrowRight aria-hidden="true" size={18} />
          </Button>
        </form>

        <p className={["text-center text-label-bold font-medium normal-case tracking-normal text-on-surface-variant", pageMessage ? "mt-sm" : "mt-md"].join(" ")}>
          Belum punya akun?{" "}
          <Link className="font-bold text-secondary underline-offset-4 hover:underline" to={registerHref}>
            Daftar
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

function LoginMessage({ message, ref }: { message: PageMessage; ref: React.Ref<HTMLDivElement> }) {
  const isSuccess = message.tone === "success";
  const Icon = isSuccess ? CheckCircle2 : ShieldAlert;
  const toneClasses = {
    error: "border-error/35 bg-error-container text-error-on-container",
    success: "border-secondary/35 bg-secondary-container text-secondary-on-fixed",
    warning: "border-tertiary/35 bg-tertiary-container text-tertiary-on-container",
  }[message.tone];

  return (
    <div
      aria-live="polite"
      className={["flex items-start gap-sm rounded border px-md py-sm text-[14px] leading-5 outline-none", toneClasses].join(" ")}
      id="login-message"
      ref={ref}
      role={message.tone === "error" ? "alert" : "status"}
      tabIndex={-1}
    >
      <Icon aria-hidden="true" className="mt-xs shrink-0" size={18} />
      <p>{message.text}</p>
    </div>
  );
}

function getPageMessage(query: URLSearchParams, submitError: string | null): PageMessage | null {
  if (submitError) {
    return { text: submitError, tone: "error" };
  }
  if (query.get("registered") === "1") {
    return { text: "Akun berhasil dibuat. Silakan masuk untuk melanjutkan.", tone: "success" };
  }
  if (query.get("expired") === "1") {
    return { text: "Sesi Anda berakhir. Silakan masuk kembali.", tone: "warning" };
  }
  return null;
}

function getRegisterHref(redirectTarget: string | null) {
  if (!redirectTarget || !redirectTarget.startsWith("/") || redirectTarget.startsWith("//")) {
    return "/register";
  }

  let parsed: URL;
  try {
    parsed = new URL(redirectTarget, "http://app.local");
  } catch {
    return "/register";
  }

  if (parsed.origin !== "http://app.local" || (parsed.pathname !== "/student" && !parsed.pathname.startsWith("/student/"))) {
    return "/register";
  }

  return `/register?redirect=${encodeURIComponent(`${parsed.pathname}${parsed.search}${parsed.hash}`)}`;
}
