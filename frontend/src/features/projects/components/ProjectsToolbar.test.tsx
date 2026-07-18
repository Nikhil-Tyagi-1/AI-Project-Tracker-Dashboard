import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";

import { ProjectsToolbar } from "@/features/projects/components/ProjectsToolbar";

function renderToolbar(
  props?: Partial<ComponentProps<typeof ProjectsToolbar>>,
) {
  const defaults: ComponentProps<typeof ProjectsToolbar> = {
    searchValue: "",
    onSearchChange: vi.fn(),
    onClearSearch: vi.fn(),
    status: "",
    onStatusChange: vi.fn(),
    priority: "",
    onPriorityChange: vi.fn(),
    owner: "",
    onOwnerChange: vi.fn(),
    sortBy: "createdAt",
    sortOrder: "desc",
    onSortByChange: vi.fn(),
    onSortOrderChange: vi.fn(),
    canReset: false,
    onResetFilters: vi.fn(),
    ...props,
  };

  const view = render(<ProjectsToolbar {...defaults} />);
  return { ...defaults, ...view };
}

describe("ProjectsToolbar", () => {
  it("updates the search input as the user types", async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    renderToolbar({ onSearchChange });

    await user.type(
      screen.getByRole("textbox", { name: /^search$/i }),
      "portal",
    );

    expect(onSearchChange).toHaveBeenCalled();
    expect(onSearchChange.mock.calls.map((call) => call[0]).join("")).toBe(
      "portal",
    );
  });

  it("clears search when the clear control is clicked", async () => {
    const user = userEvent.setup();
    const onClearSearch = vi.fn();
    renderToolbar({ searchValue: "portal", onClearSearch });

    await user.click(screen.getByRole("button", { name: /clear search/i }));
    expect(onClearSearch).toHaveBeenCalledTimes(1);
  });

  it("filters by status", async () => {
    const user = userEvent.setup();
    const onStatusChange = vi.fn();
    renderToolbar({ onStatusChange });

    await user.click(screen.getByRole("combobox", { name: /^status$/i }));
    await user.click(screen.getByRole("option", { name: /in progress/i }));

    expect(onStatusChange).toHaveBeenCalledWith("IN_PROGRESS");
  });

  it("filters by priority", async () => {
    const user = userEvent.setup();
    const onPriorityChange = vi.fn();
    renderToolbar({ onPriorityChange });

    await user.click(screen.getByRole("combobox", { name: /^priority$/i }));
    await user.click(screen.getByRole("option", { name: /^high$/i }));

    expect(onPriorityChange).toHaveBeenCalledWith("HIGH");
  });

  it("filters by owner name", async () => {
    const user = userEvent.setup();
    const onOwnerChange = vi.fn();
    renderToolbar({ onOwnerChange });

    await user.type(
      screen.getByRole("textbox", { name: /^owner$/i }),
      "Alex",
    );

    expect(onOwnerChange).toHaveBeenCalled();
    expect(onOwnerChange.mock.calls.map((call) => call[0]).join("")).toBe(
      "Alex",
    );
  });

  it("disables reset when there are no active filters", () => {
    renderToolbar({ canReset: false });
    expect(
      screen.getByRole("button", { name: /reset filters/i }),
    ).toBeDisabled();
  });

  it("invokes reset when Reset filters is clicked", async () => {
    const user = userEvent.setup();
    const onResetFilters = vi.fn();
    renderToolbar({ canReset: true, onResetFilters });

    await user.click(screen.getByRole("button", { name: /reset filters/i }));
    expect(onResetFilters).toHaveBeenCalledTimes(1);
  });
});
