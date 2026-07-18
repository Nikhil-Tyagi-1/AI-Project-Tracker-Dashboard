import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";

import { ProjectForm } from "@/features/projects/components/ProjectForm";
import {
  PROJECT_FORM_DEFAULT_VALUES,
  type ProjectFormValues,
} from "@/features/projects/projectFormSchema";
import type { ProjectOwner } from "@/types/project";

const owners: ProjectOwner[] = [
  { id: "user-1", name: "Alex Morgan", email: "alex@example.com" },
  { id: "user-2", name: "Jordan Lee", email: "jordan@example.com" },
];

const defaultValues: ProjectFormValues = {
  ...PROJECT_FORM_DEFAULT_VALUES,
  ownerId: "user-1",
};

function renderForm(props?: Partial<ComponentProps<typeof ProjectForm>>) {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();

  const view = render(
    <ProjectForm
      mode="create"
      defaultValues={defaultValues}
      ownerOptions={owners}
      onSubmit={onSubmit}
      onCancel={onCancel}
      {...props}
    />,
  );

  return { onSubmit, onCancel, ...view };
}

function submitButton(container: HTMLElement) {
  return within(container).getByRole("button", { name: "Create project" });
}

describe("ProjectForm validation (component)", () => {
  it("shows required-field errors when submitting an empty name", async () => {
    const user = userEvent.setup();
    const { onSubmit, container } = renderForm({
      defaultValues: { ...defaultValues, name: "", ownerId: "" },
    });

    await user.click(submitButton(container));

    expect(
      await screen.findByText(/name must be at least 3 characters/i),
    ).toBeInTheDocument();
    expect(await screen.findByText(/owner is required/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows an error for invalid progress above 100", async () => {
    const user = userEvent.setup();
    const { onSubmit, container } = renderForm({
      defaultValues: {
        ...defaultValues,
        name: "Valid Project",
        progress: 0,
      },
    });

    const progress = screen.getByRole("spinbutton", { name: /^progress$/i });
    await user.clear(progress);
    await user.type(progress, "150");
    await user.click(submitButton(container));

    expect(
      await screen.findByText(/progress must be at most 100/i),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows an error when end date precedes start date", async () => {
    const user = userEvent.setup();
    const { onSubmit, container } = renderForm({
      defaultValues: {
        ...defaultValues,
        name: "Valid Project",
        startDate: "2024-06-01",
        endDate: "2024-05-01",
      },
    });

    await user.click(submitButton(container));

    expect(
      await screen.findByText(/enddate must be on or after startdate/i),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows an error when COMPLETED status has progress below 100", async () => {
    const user = userEvent.setup();
    const { onSubmit, container } = renderForm({
      defaultValues: {
        ...defaultValues,
        name: "Almost Done",
        status: "COMPLETED",
        progress: 80,
      },
    });

    await user.click(submitButton(container));

    expect(
      await screen.findByText(/progress must be 100 when status is completed/i),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits a valid form payload", async () => {
    const user = userEvent.setup();
    const { onSubmit, container } = renderForm({
      defaultValues: {
        ...defaultValues,
        name: "Valid Project",
        progress: 40,
        startDate: "2024-01-01",
        endDate: "2024-12-31",
      },
    });

    await user.click(submitButton(container));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({
      name: "Valid Project",
      ownerId: "user-1",
      progress: 40,
      startDate: "2024-01-01",
      endDate: "2024-12-31",
    });
  });
});
