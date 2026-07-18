import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";

import { TaskForm } from "@/features/tasks/components/TaskForm";
import {
  TASK_FORM_DEFAULT_VALUES,
  type TaskFormValues,
} from "@/features/tasks/taskFormSchema";
import type { TaskAssigneeOption } from "@/features/tasks/taskFormUtils";

const assignees: TaskAssigneeOption[] = [
  { id: "user-1", name: "Alex Morgan", email: "alex@example.com" },
  { id: "user-2", name: "Jordan Lee", email: "jordan@example.com" },
];

const defaultValues: TaskFormValues = {
  ...TASK_FORM_DEFAULT_VALUES,
  title: "Wire Kanban filters",
};

function renderForm(props?: Partial<ComponentProps<typeof TaskForm>>) {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();

  const view = render(
    <TaskForm
      mode="create"
      defaultValues={defaultValues}
      assigneeOptions={assignees}
      onSubmit={onSubmit}
      onCancel={onCancel}
      {...props}
    />,
  );

  return { onSubmit, onCancel, ...view };
}

function submitButton(container: HTMLElement, label = "Create task") {
  return within(container).getByRole("button", { name: label });
}

describe("TaskForm validation (component)", () => {
  it("shows a title error when submitting an empty title", async () => {
    const user = userEvent.setup();
    const { onSubmit, container } = renderForm({
      defaultValues: { ...defaultValues, title: "" },
    });

    await user.click(submitButton(container));

    expect(
      await screen.findByText(/title must be at least 3 characters/i),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows a title error when the title is too short", async () => {
    const user = userEvent.setup();
    const { onSubmit, container } = renderForm({
      defaultValues: { ...defaultValues, title: "ab" },
    });

    await user.click(submitButton(container));

    expect(
      await screen.findByText(/title must be at least 3 characters/i),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits a valid create payload", async () => {
    const user = userEvent.setup();
    const { onSubmit, container } = renderForm({
      defaultValues: {
        ...defaultValues,
        title: "Valid task title",
        description: "Optional notes",
        status: "IN_PROGRESS",
        priority: "HIGH",
        assigneeId: "user-1",
        dueDate: "2026-08-15",
      },
    });

    await user.click(submitButton(container));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({
      title: "Valid task title",
      description: "Optional notes",
      status: "IN_PROGRESS",
      priority: "HIGH",
      assigneeId: "user-1",
      dueDate: "2026-08-15",
    });
  });

  it("disables save on an unchanged edit form", async () => {
    const { container } = renderForm({
      mode: "edit",
      defaultValues,
      submitLabel: "Save changes",
    });

    expect(submitButton(container, "Save changes")).toBeDisabled();
    expect(
      screen.getByText(/make a change to enable saving/i),
    ).toBeInTheDocument();
  });

  it("calls onCancel when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const { onCancel, container } = renderForm();

    await user.click(within(container).getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
