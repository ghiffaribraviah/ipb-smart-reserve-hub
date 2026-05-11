import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { PasswordField } from "./PasswordField";

describe("PasswordField", () => {
  it("toggles password visibility without changing the current value", async () => {
    const user = userEvent.setup();

    render(<PasswordField id="password" label="Kata sandi" />);

    const input = screen.getByLabelText("Kata sandi");
    await user.type(input, "rahasia-123");

    expect(input).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: "Tampilkan kata sandi" }));

    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveValue("rahasia-123");

    await user.click(screen.getByRole("button", { name: "Sembunyikan kata sandi" }));

    expect(input).toHaveAttribute("type", "password");
    expect(input).toHaveValue("rahasia-123");
  });
});
