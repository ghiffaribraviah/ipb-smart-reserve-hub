import type { ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-surface-container-lowest text-on-surface">
      <div className="grid min-h-screen md:grid-cols-2">
        <section className="relative grid min-h-screen place-items-center bg-surface-container-lowest px-lg py-lg sm:py-xl">
          <div className="w-full max-w-[420px]">{children}</div>
          <p className="absolute bottom-lg left-0 hidden w-full px-lg text-center text-label-sm text-on-surface-variant sm:block">
            © 2026 IPB Smart Reserve Hub.
          </p>
        </section>
        <section className="hidden min-h-screen bg-primary-container md:block">
          <div className="relative h-full min-h-screen overflow-hidden">
            <img
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              src="/auth-campus.svg"
            />
            <div className="absolute inset-0 bg-primary-container/16" />
          </div>
        </section>
      </div>
    </main>
  );
}
