import { Outlet } from "react-router-dom";
import { useAuth } from "../lib/use-auth";

export function StudentShell() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-svh flex-col">
      <header className="bg-primary px-6 py-4 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="text-lg font-bold">Emerald Reserve</span>
          <div className="flex items-center gap-4">
            <span className="text-sm">{user?.full_name}</span>
            <button
              onClick={logout}
              className="rounded bg-primary-light px-3 py-1 text-sm hover:bg-primary-light/80"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 p-6">
        <Outlet />
      </main>

      <footer className="bg-primary px-6 py-4 text-center text-sm text-white/70">
        IPB Smart Reserve Hub
      </footer>
    </div>
  );
}
