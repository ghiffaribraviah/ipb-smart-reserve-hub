import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FormField } from "./FormField";

describe("FormField", () => {
  it("associates label, help text, and error text with the input", () => {
    render(
      <FormField
        error="Email wajib menggunakan domain IPB."
        helpText="Gunakan email institusi."
        id="email"
        label="Email"
        required
        type="email"
      />,
    );

    const input = screen.getByRole("textbox", { name: /email/i });

    expect(input).toHaveAttribute("type", "email");
    expect(input).toBeRequired();
    expect(input).toHaveAccessibleDescription("Gunakan email institusi. Email wajib menggunakan domain IPB.");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("keeps disabled fields discoverable through their label", () => {
    render(<FormField disabled id="nim" label="NIM" value="G64000000" readOnly />);

    expect(screen.getByLabelText("NIM")).toBeDisabled();
  });
});
