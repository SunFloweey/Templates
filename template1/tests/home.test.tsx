import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "../app/page";

describe("Coterie workspace", () => {
  it("toggles onboarding tasks and updates the completion percentage", async () => {
    window.location.hash = "#overview";
    render(<Home />);

    expect(screen.getByText("25%")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Tax and bank forms/i }));

    await waitFor(() => expect(screen.getByText("38%")).toBeInTheDocument());
  });

  it("filters people from the People view search field", async () => {
    window.location.hash = "#people";
    render(<Home />);

    fireEvent.change(screen.getByLabelText("Search people"), { target: { value: "payroll" } });

    await waitFor(() => expect(screen.getAllByText("Nadia Reyes").length).toBeGreaterThan(0));
    expect(screen.queryByText("Mira Okafor")).not.toBeInTheDocument();
  });
});
