import { Button } from "../../components/ui/Button";
import { CheckboxRow } from "../../components/ui/CheckboxRow";
import { FormPreview } from "../../components/ui/FormPreview";
import { RatingInput } from "../../components/ui/RatingInput";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { uiPrimitiveFixture } from "../../fixtures/uiPrimitives";

function ReferenceCard({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
      <h2 className="mb-4 text-lg font-bold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}

export function UiPrimitivesPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#111827]">
      <div className="mx-auto w-[1200px] max-w-[95%] py-12 pb-20 max-md:w-full max-md:max-w-full max-md:px-4 max-md:py-7 max-md:pb-14">
        <p className="mb-8 font-serif text-[34px] font-bold leading-none text-[#1d7667] max-md:text-[32px]">
          IPB SRH
        </p>
        <h1 className="mb-2 text-[32px] font-bold leading-tight text-slate-950 max-md:text-[28px]">
          UI Primitives
        </h1>
        <p className="m-0 text-sm leading-6 text-slate-500">
          Standalone reference for buttons, form controls, status badges, checkbox rows,
          and rating input.
        </p>

        <div className="mt-7 grid grid-cols-2 gap-6 max-md:grid-cols-1">
          <ReferenceCard title="Buttons">
            <div className="flex flex-wrap items-center gap-3.5 max-md:grid max-md:grid-cols-1">
              {uiPrimitiveFixture.buttons.map((button) => (
                <Button
                  disabled={"disabled" in button ? button.disabled : false}
                  key={button.label}
                  variant={button.variant}
                >
                  {button.label}
                </Button>
              ))}
            </div>
          </ReferenceCard>

          <ReferenceCard title="Status Badges">
            <div className="flex flex-wrap items-center gap-3 max-md:grid max-md:grid-cols-1">
              {uiPrimitiveFixture.badges.map((badge) => (
                <StatusBadge key={badge.label} label={badge.label} tone={badge.tone} />
              ))}
            </div>
          </ReferenceCard>

          <ReferenceCard title="Form Controls">
            <div className="grid gap-4">
              {uiPrimitiveFixture.fields.map((field) => (
                <FormPreview
                  error={"error" in field ? field.error : false}
                  key={field.label}
                  label={field.label}
                  multiline={"multiline" in field ? field.multiline : false}
                  value={field.value}
                />
              ))}
            </div>
          </ReferenceCard>

          <ReferenceCard title="Checkbox dan Rating">
            <div className="grid gap-[18px]">
              <CheckboxRow
                description={uiPrimitiveFixture.checkbox.description}
                label={uiPrimitiveFixture.checkbox.label}
              />
              <RatingInput value={uiPrimitiveFixture.rating} />
            </div>
          </ReferenceCard>
        </div>
      </div>
    </main>
  );
}
