import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "../app/page";

describe("Fernly workspace", () => {
  it("creates a project from the dashboard modal", async () => {
    window.location.hash = "#dashboard";
    render(<Home />);

    fireEvent.click(screen.getByRole("button", { name: "Add Project" }));
    fireEvent.change(screen.getByLabelText("Project name"), { target: { value: "Research Portal" } });
    fireEvent.click(screen.getByRole("button", { name: "Add project" }));

    expect(await screen.findByText("Research Portal")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Research Portal was added to projects.");
  });

  it("filters tasks from the global search field", async () => {
    window.location.hash = "#tasks";
    render(<Home />);

    const search = screen.getByPlaceholderText("Search tasks");
    fireEvent.change(search, { target: { value: "Passkey" } });

    await waitFor(() => expect(screen.getByText("Passkey sign-in")).toBeInTheDocument());
    expect(screen.queryByText("Saved filters for projects")).not.toBeInTheDocument();
  });
});
