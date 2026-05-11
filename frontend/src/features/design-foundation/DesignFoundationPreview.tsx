import { Bell, Save, Search } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { FormField } from "../../components/ui/FormField";
import { PasswordField } from "../../components/ui/PasswordField";
import { StatePanel } from "../../components/ui/StatePanel";

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
      </section>
    </main>
  );
}
