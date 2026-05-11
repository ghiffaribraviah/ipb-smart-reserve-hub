import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CheckCircle2, IdCard, LockKeyhole, Mail, Phone, ShieldAlert, UserRound } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation } from "react-router-dom";
import { z } from "zod";
import { Button } from "../../components/ui/Button";
import { FormField } from "../../components/ui/FormField";
import { PasswordField } from "../../components/ui/PasswordField";
import { ApiError } from "../../lib/apiClient";
import { AuthLayout } from "./AuthLayout";
import { useAuth } from "./authSession";
import { safeRedirectForRole } from "./redirects";
import type { UserAccount } from "./types";

type PageMessage = {
  text: string;
  tone: "success" | "error";
};

const registerSchema = z
  .object({
    confirmPassword: z.string().min(1, "Konfirmasi kata sandi wajib diisi."),
    email: z
      .string()
      .trim()
      .min(1, "Email institusi mahasiswa wajib diisi.")
      .email("Masukkan format email yang valid.")
      .refine((value) => value.toLowerCase().endsWith("@apps.ipb.ac.id"), "Gunakan email mahasiswa apps.ipb.ac.id."),
    full_name: z.string().trim().min(1, "Nama lengkap wajib diisi."),
    nim: z
      .string()
      .trim()
      .min(1, "NIM wajib diisi.")
      .regex(/^[A-Za-z0-9]{6,20}$/, "Masukkan NIM dengan format yang valid."),
    password: z.string().min(1, "Kata sandi wajib diisi.").min(8, "Kata sandi minimal 8 karakter."),
    phone: z
      .string()
      .trim()
      .min(1, "Nomor telepon wajib diisi.")
      .refine(isIndonesianPhone, "Masukkan nomor telepon Indonesia yang valid."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Konfirmasi kata sandi harus sama.",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const { apiClient } = useAuth();
  const location = useLocation();
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const redirectTarget = safeRedirectForRole(query.get("redirect"), "student");
  const [pageMessage, setPageMessage] = useState<PageMessage | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const {
    formState: { errors, isDirty, isSubmitting },
    handleSubmit,
    register,
    resetField,
    setError,
    setFocus,
  } = useForm<RegisterFormValues>({
    defaultValues: {
      confirmPassword: "",
      email: "",
      full_name: "",
      nim: "",
      password: "",
      phone: "",
    },
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    document.title = "Daftar Akun - IPB Smart Reserve Hub";
  }, []);

  useEffect(() => {
    if (!isDirty || isSuccess) {
      return;
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, isSuccess]);

  useEffect(() => {
    if (pageMessage?.tone === "error") {
      messageRef.current?.focus();
    }
  }, [pageMessage]);

  useEffect(() => {
    if (isSuccess) {
      successRef.current?.focus();
    }
  }, [isSuccess]);

  async function onSubmit(values: RegisterFormValues) {
    setPageMessage(null);
    try {
      await apiClient.request<UserAccount>("/auth/register", {
        auth: false,
        body: {
          email: values.email.trim(),
          full_name: values.full_name.trim(),
          nim: values.nim.trim(),
          password: values.password,
          phone: values.phone.trim(),
        },
        method: "POST",
      });
      setIsSuccess(true);
      setPageMessage({ text: "Akun berhasil dibuat. Silakan masuk untuk melanjutkan.", tone: "success" });
    } catch (error) {
      handleSubmitError(error);
    }
  }

  function handleSubmitError(error: unknown) {
    if (error instanceof ApiError) {
      const emailMessage = emailErrorMessage(error);
      if (emailMessage) {
        setError("email", { message: emailMessage, type: "server" }, { shouldFocus: true });
        resetField("password");
        resetField("confirmPassword");
        return;
      }
      setPageMessage({ text: error.message, tone: "error" });
      return;
    }
    setPageMessage({ text: "Registrasi belum dapat diproses. Silakan coba lagi.", tone: "error" });
  }

  function onInvalid() {
    const firstField = ["full_name", "nim", "phone", "email", "password", "confirmPassword"].find((field) => errors[field as keyof RegisterFormValues]);
    if (firstField) {
      setFocus(firstField as keyof RegisterFormValues);
    }
  }

  const loginHref = loginHrefWithRedirect(redirectTarget, isSuccess);

  return (
    <AuthLayout maxWidthClassName="max-w-[480px]">
      <div className="w-full">
        <header className="mb-md text-center">
          <p className="text-[34px] font-bold leading-[1.03] text-secondary sm:text-[40px]">
            IPB
            <br />
            SRH
          </p>
          <p className="mt-xs text-h3 font-bold text-on-surface">IPB Smart Reserve Hub</p>
        </header>

        {isSuccess ? (
          <RegisterSuccess loginHref={loginHref} message={pageMessage?.text ?? "Akun berhasil dibuat. Silakan masuk untuk melanjutkan."} ref={successRef} />
        ) : (
          <>
            <div className="mb-sm">
              <h1 className="text-h3 font-bold text-on-surface">Daftar Akun</h1>
              <p className="mt-xs text-label-bold font-medium normal-case tracking-normal text-on-surface-variant">
                Buat akun mahasiswa untuk mengelola peminjaman fasilitas kampus.
              </p>
            </div>

            <form aria-describedby={pageMessage ? "register-message" : undefined} className="grid gap-sm" noValidate onSubmit={handleSubmit(onSubmit, onInvalid)}>
              {pageMessage ? <RegisterMessage message={pageMessage} ref={messageRef} /> : null}
              <FormField
                autoComplete="name"
                compact
                error={errors.full_name?.message}
                id="register-full-name"
                label="Nama lengkap"
                leadingIcon={<UserRound aria-hidden="true" size={18} />}
                placeholder="Masukkan nama lengkap"
                required
                {...register("full_name")}
              />
              <div className="grid gap-sm min-[380px]:grid-cols-2">
                <FormField
                  autoComplete="off"
                  compact
                  error={errors.nim?.message}
                  id="register-nim"
                  label="NIM"
                  leadingIcon={<IdCard aria-hidden="true" size={18} />}
                  placeholder="G64000000"
                  required
                  {...register("nim")}
                />
                <FormField
                  autoComplete="tel"
                  compact
                  error={errors.phone?.message}
                  id="register-phone"
                  inputMode="tel"
                  label="Nomor telepon"
                  leadingIcon={<Phone aria-hidden="true" size={18} />}
                  placeholder="08123456789"
                  required
                  {...register("phone")}
                />
              </div>
              <FormField
                autoComplete="email"
                compact
                error={errors.email?.message}
                id="register-email"
                label="Email institusi mahasiswa"
                leadingIcon={<Mail aria-hidden="true" size={18} />}
                placeholder="nama@apps.ipb.ac.id"
                required
                type="email"
                {...register("email")}
              />
              <div className="grid gap-sm min-[380px]:grid-cols-2">
                <PasswordField
                  autoComplete="new-password"
                  compact
                  error={errors.password?.message}
                  id="register-password"
                  label="Kata sandi"
                  leadingIcon={<LockKeyhole aria-hidden="true" size={18} />}
                  placeholder="••••••••"
                  required
                  {...register("password")}
                />
                <PasswordField
                  autoComplete="new-password"
                  compact
                  error={errors.confirmPassword?.message}
                  id="register-confirm-password"
                  label="Konfirmasi kata sandi"
                  leadingIcon={<LockKeyhole aria-hidden="true" size={18} />}
                  placeholder="••••••••"
                  required
                  {...register("confirmPassword")}
                />
              </div>
              <Button className="min-h-11 w-full" isLoading={isSubmitting} size="md" type="submit">
                Daftar
                <ArrowRight aria-hidden="true" size={18} />
              </Button>
            </form>

            <p className="mt-sm text-center text-label-bold font-medium normal-case tracking-normal text-on-surface-variant">
              Sudah punya akun?{" "}
              <Link className="font-bold text-secondary underline-offset-4 hover:underline" to={loginHrefWithRedirect(redirectTarget, false)}>
                Masuk
              </Link>
            </p>
          </>
        )}
      </div>
    </AuthLayout>
  );
}

function RegisterMessage({ message, ref }: { message: PageMessage; ref: React.Ref<HTMLDivElement> }) {
  const isSuccess = message.tone === "success";
  const Icon = isSuccess ? CheckCircle2 : ShieldAlert;
  const toneClasses = isSuccess ? "border-secondary/35 bg-secondary-container text-secondary-on-fixed" : "border-error/35 bg-error-container text-error-on-container";

  return (
    <div
      aria-live="polite"
      className={["flex items-start gap-sm rounded border px-md py-sm text-[14px] leading-5 outline-none", toneClasses].join(" ")}
      id="register-message"
      ref={ref}
      role={isSuccess ? "status" : "alert"}
      tabIndex={-1}
    >
      <Icon aria-hidden="true" className="mt-xs shrink-0" size={18} />
      <p>{message.text}</p>
    </div>
  );
}

function RegisterSuccess({ loginHref, message, ref }: { loginHref: string; message: string; ref: React.Ref<HTMLDivElement> }) {
  return (
    <section className="grid gap-lg text-center">
      <div
        aria-live="polite"
        className="grid gap-md rounded border border-secondary/35 bg-secondary-container px-lg py-lg text-secondary-on-fixed outline-none"
        ref={ref}
        role="status"
        tabIndex={-1}
      >
        <CheckCircle2 aria-hidden="true" className="mx-auto" size={32} />
        <h1 className="text-h3 font-bold">Daftar Akun</h1>
        <p className="text-body-md">{message}</p>
      </div>
      <Link
        className="inline-flex min-h-12 w-full items-center justify-center gap-sm rounded bg-secondary px-lg text-body-md font-bold text-secondary-on transition-colors hover:bg-secondary-on-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
        to={loginHref}
      >
        Masuk Sekarang
        <ArrowRight aria-hidden="true" size={18} />
      </Link>
    </section>
  );
}

function isIndonesianPhone(value: string) {
  const normalized = value.replace(/[\s-]/g, "");
  return /^(08\d{8,12}|\+62\d{8,13}|62\d{8,13})$/.test(normalized);
}

function emailErrorMessage(error: ApiError) {
  const fieldError = error.fieldErrors.email;
  if (fieldError) {
    return fieldError;
  }
  if (error.status === 400 && error.message.includes("domain")) {
    return error.message;
  }
  if (error.status === 409 && error.message.toLowerCase().includes("email")) {
    return error.message;
  }
  return null;
}

function loginHrefWithRedirect(redirectTarget: string | null, registered: boolean) {
  const params = new URLSearchParams();
  if (registered) {
    params.set("registered", "1");
  }
  if (redirectTarget) {
    params.set("redirect", redirectTarget);
  }
  const query = params.toString();
  return query ? `/login?${query}` : "/login";
}
