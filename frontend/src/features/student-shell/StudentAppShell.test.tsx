import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { UserAccount } from "../auth/types";
import { StudentAppShell, getStudentActiveNav, isStudentShellSearchVisible } from "./StudentAppShell";

const studentUser: UserAccount = {
  academic_profile: null,
  email: "student@apps.ipb.ac.id",
  full_name: "Rani Prameswari",
  id: "student-1",
  is_active: true,
  nim: "G64000000",
  phone: "08123456789",
  role: "student",
};

function LocationText() {
  const location = useLocation();
  return <span data-testid="location">{location.pathname + location.search}</span>;
}

function renderShell({
  confirmNavigation = () => true,
  initialPath = "/student",
  logout = vi.fn(),
  notificationCount,
}: {
  confirmNavigation?: () => boolean;
  initialPath?: string;
  logout?: () => void;
  notificationCount?: number;
} = {}) {
  return {
    logout,
    ...render(
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route
            element={
              <StudentAppShell
                confirmNavigation={confirmNavigation}
                currentUser={studentUser}
                logout={logout}
                notificationCount={notificationCount}
              />
            }
          >
            <Route element={<h1>Beranda Mahasiswa</h1>} path="/student" />
            <Route
              element={
                <>
                  <h1>Katalog Fasilitas</h1>
                  <LocationText />
                </>
              }
              path="/student/facilities"
            />
            <Route element={<h1>Form Waktu Reservasi</h1>} path="/student/facilities/:facilityId/reserve/time" />
            <Route element={<h1>Profil Mahasiswa</h1>} path="/student/profile" />
          </Route>
          <Route element={<LocationText />} path="*" />
        </Routes>
      </MemoryRouter>,
    ),
  };
}

describe("student app shell", () => {
  it.each([
    ["/student", "Beranda"],
    ["/student/facilities", "Fasilitas"],
    ["/student/facilities/auditorium/reserve/time", "Fasilitas"],
    ["/student/reservations/42/payment/waiting", "Reservasi"],
    ["/student/profile", "Profil"],
  ])("maps %s to %s", (path, activeNav) => {
    expect(getStudentActiveNav(path)).toBe(activeNav);
  });

  it("shows global shell search on content routes and hides it on workflow routes", () => {
    expect(isStudentShellSearchVisible("/student")).toBe(true);
    expect(isStudentShellSearchVisible("/student/facilities/graha-widya")).toBe(true);
    expect(isStudentShellSearchVisible("/student/profile")).toBe(true);
    expect(isStudentShellSearchVisible("/student/facilities/graha-widya/reserve/time")).toBe(false);
    expect(isStudentShellSearchVisible("/student/reservations/42/payment")).toBe(false);
  });

  it("routes non-empty and empty global searches to the Facility Catalog", async () => {
    const user = userEvent.setup();
    renderShell();

    await user.type(screen.getAllByRole("searchbox", { name: "Cari fasilitas" })[0], "Auditorium CCR");
    await user.click(screen.getAllByRole("button", { name: "Cari" })[0]);

    expect(await screen.findByTestId("location")).toHaveTextContent("/student/facilities?q=Auditorium+CCR");

    await user.click(screen.getAllByRole("searchbox", { name: "Cari fasilitas" })[0]);
    await user.keyboard("{Control>}a{/Control}{Backspace}");
    await user.click(screen.getAllByRole("button", { name: "Cari" })[0]);

    expect(await screen.findByTestId("location")).toHaveTextContent("/student/facilities");
  });

  it("honors the navigation guard for nav links and global search", async () => {
    const user = userEvent.setup();
    const confirmNavigation = vi.fn().mockReturnValue(false);
    renderShell({ confirmNavigation });

    await user.click(screen.getAllByRole("link", { name: "Fasilitas" })[0]);
    expect(confirmNavigation).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("heading", { name: "Beranda Mahasiswa" })).toBeVisible();

    await user.type(screen.getAllByRole("searchbox", { name: "Cari fasilitas" })[0], "Gymnasium");
    await user.click(screen.getAllByRole("button", { name: "Cari" })[0]);
    expect(confirmNavigation).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("heading", { name: "Beranda Mahasiswa" })).toBeVisible();
  });

  it("opens the profile menu, links to profile, delegates logout, and renders notification badge only when present", async () => {
    const user = userEvent.setup();
    const logout = vi.fn();
    renderShell({ logout, notificationCount: 3 });

    expect(screen.getByRole("button", { name: "Notifikasi, 3 belum dibaca" })).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Menu profil Rani Prameswari" }));
    await user.click(screen.getByRole("menuitem", { name: "Profil Saya" }));
    expect(await screen.findByRole("heading", { name: "Profil Mahasiswa" })).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Menu profil Rani Prameswari" }));
    await user.click(screen.getByRole("menuitem", { name: "Keluar" }));
    expect(logout).toHaveBeenCalledTimes(1);
  });

  it("omits the notification badge when count is missing or zero", () => {
    renderShell();

    expect(screen.getByRole("button", { name: "Notifikasi" })).toBeVisible();
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("closes the profile menu with Escape and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    renderShell();

    const profileButton = screen.getByRole("button", { name: "Menu profil Rani Prameswari" });
    await user.click(profileButton);
    expect(screen.getByRole("menu")).toBeVisible();

    await user.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
    expect(profileButton).toHaveFocus();
  });
});
