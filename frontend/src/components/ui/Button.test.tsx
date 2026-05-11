import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Save } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("prevents duplicate activation while showing a stable loading state", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Button isLoading onClick={onClick}>
        Simpan
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Simpan" });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");

    await user.click(button);

    expect(onClick).not.toHaveBeenCalled();
  });

  it("requires an accessible label for icon-only buttons", () => {
    render(
      <Button aria-label="Simpan perubahan" iconOnly>
        <Save aria-hidden="true" />
      </Button>,
    );

    expect(screen.getByRole("button", { name: "Simpan perubahan" })).toBeVisible();
  });
});
