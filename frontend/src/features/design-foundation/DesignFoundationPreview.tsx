import { Bell, Save, Search } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { FormField } from "../../components/ui/FormField";
import { PasswordField } from "../../components/ui/PasswordField";
import { StatePanel } from "../../components/ui/StatePanel";
import { UserAccount } from "../auth/types";
import { StudentAppShell } from "../student-shell/StudentAppShell";

const previewStudent: UserAccount = {
  academic_profile: {
    degree: "S1",
    entry_year: 2022,
    faculty: "FMIPA",
    program_studi: "Ilmu Komputer",
  },
  email: "rani@apps.ipb.ac.id",
  full_name: "Rani Prameswari",
  id: "student-preview",
  is_active: true,
  nim: "G64000000",
  phone: "08123456789",
  role: "student",
};

export function DesignFoundationPreview() {
  return (
    <main className="min-h-screen bg-background px-md py-lg text-on-surface sm:px-xl">
      <section className="mx-auto flex max-w-container flex-col gap-lg">
        <div className="flex flex-col gap-md border-b border-outline-variant pb-lg md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-label-bold uppercase text-secondary">IPB Smart Reserve Hub</p>
            <h1 className="mt-sm text-h2 text-primary-container">Shared Design Foundation</h1>
            <p className="mt-sm max-w-3xl text-body-md text-on-surface-variant">
              Reusable frontend primitives for student and authentication workflows.
            </p>
          </div>
          <div className="flex flex-wrap gap-sm">
            <Button>
              <Save aria-hidden="true" size={18} />
              Simpan
            </Button>
            <Button variant="outline">
              <Search aria-hidden="true" size={18} />
              Cari fasilitas
            </Button>
            <Button aria-label="Notifikasi" iconOnly variant="secondary">
              <Bell aria-hidden="true" size={18} />
            </Button>
          </div>
        </div>

        <div className="grid gap-lg lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.7fr)]">
          <section className="rounded-lg bg-surface-container-lowest p-lg shadow-ambient">
            <div>
              <p className="text-label-bold uppercase text-secondary">Form controls</p>
              <h2 className="mt-xs text-h3 text-primary-container">Accessible student inputs</h2>
            </div>
            <div className="mt-lg grid gap-md">
              <FormField
                helpText="Gunakan email institusi untuk masuk."
                id="preview-email"
                label="Email"
                placeholder="nama@apps.ipb.ac.id"
                required
                type="email"
              />
              <PasswordField
                helpText="Minimal 8 karakter."
                id="preview-password"
                label="Kata sandi"
                required
              />
              <FormField
                error="NIM wajib diisi sebelum melanjutkan."
                id="preview-nim"
                label="NIM"
                placeholder="G64000000"
                required
              />
            </div>
          </section>

          <section className="grid gap-md">
            <StatePanel
              message="Memuat daftar fasilitas."
              state="loading"
              title="Memuat"
            />
            <StatePanel
              actionLabel="Coba lagi"
              message="Koneksi ke layanan fasilitas gagal."
              onAction={() => undefined}
              state="error"
              title="Data belum tersedia"
            />
          </section>
        </div>

        <section className="grid gap-sm rounded-lg bg-primary-container p-lg text-primary-on shadow-ambient sm:grid-cols-3">
          <div>
            <p className="text-label-sm uppercase text-primary-on-container">Primary</p>
            <p className="mt-xs text-body-md">Dark emerald anchors navigation and hierarchy.</p>
          </div>
          <div>
            <p className="text-label-sm uppercase text-primary-on-container">Secondary</p>
            <p className="mt-xs text-body-md">Mint actions keep reservation workflows clear.</p>
          </div>
          <div>
            <p className="text-label-sm uppercase text-primary-on-container">States</p>
            <p className="mt-xs text-body-md">Loading, empty, and error panels stay calm and stable.</p>
          </div>
        </section>

        <section className="grid gap-md">
          <div>
            <p className="text-label-bold uppercase text-secondary">Implemented components</p>
            <h2 className="mt-xs text-h3 text-primary-container">Student application shell</h2>
            <p className="mt-sm max-w-3xl text-body-md text-on-surface-variant">
              Authenticated student navigation, global Facility search, notification and profile affordances, and mobile bottom navigation.
            </p>
          </div>
          <StudentAppShell
            currentUser={previewStudent}
            isPreview
            logout={() => undefined}
            notificationCount={2}
            previewContent={<StudentShellPreviewContent />}
            previewPath="/student"
          />
        </section>
      </section>
    </main>
  );
}

function StudentShellPreviewContent() {
  return (
    <section className="grid gap-lg">
      <div className="grid gap-md rounded-lg bg-primary-container p-lg text-primary-on shadow-ambient md:grid-cols-[1.3fr_0.7fr]">
        <div>
          <p className="text-label-bold uppercase text-secondary-fixed">Beranda Mahasiswa</p>
          <h3 className="mt-sm text-h2">Shell preview</h3>
          <p className="mt-sm max-w-2xl text-body-md text-primary-on/82">
            Preview ini memakai data fixture untuk menunjukkan navigasi mahasiswa tanpa sesi backend.
          </p>
        </div>
        <div className="rounded-lg bg-primary-on/8 p-md">
          <p className="text-label-sm text-primary-on/70">Reservasi aktif</p>
          <p className="mt-sm text-h3">3</p>
          <p className="mt-xs text-body-md text-primary-on/78">Satu pembayaran menunggu unggahan bukti.</p>
        </div>
      </div>
      <div className="grid gap-md md:grid-cols-3">
        {["Auditorium CCR", "Ruang Seminar FMIPA", "Graha Widya Wisuda"].map((facility) => (
          <article className="rounded-lg border border-outline-variant bg-surface-container-lowest p-md shadow-control" key={facility}>
            <p className="text-label-sm text-secondary">Fasilitas unggulan</p>
            <h4 className="mt-xs text-body-lg font-bold text-primary-container">{facility}</h4>
            <p className="mt-xs text-body-md text-on-surface-variant">Tampilan ringkas untuk memeriksa spacing shell dan card.</p>
          </article>
        ))}
      </div>
    </section>
  );
}
