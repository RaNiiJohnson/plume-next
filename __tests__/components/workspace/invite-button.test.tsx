import { render, screen, fireEvent, waitFor } from "../../utils/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { InviteButton } from "@app/workspace/[workspaceId]/_components/invite-button";

// Mock des actions
vi.mock("@app/workspace/[workspaceId]/_actions", () => ({
  inviteUserAction: vi.fn(),
}));

// Mock de sonner pour les toasts
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("InviteButton", () => {
  const mockOrganizationId = "org-123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders invite button correctly", () => {
    render(<InviteButton organizationId={mockOrganizationId} />);

    expect(
      screen.getByRole("button", { name: /invite member/i })
    ).toBeInTheDocument();
  });

  it("opens dialog when button is clicked", async () => {
    render(<InviteButton organizationId={mockOrganizationId} />);

    fireEvent.click(screen.getByRole("button", { name: /invite member/i }));

    await waitFor(() => {
      expect(screen.getByText("Invite a team member")).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByText("Role")).toBeInTheDocument();
  });

  it("validates email input", async () => {
    const { toast } = await import("sonner");
    render(<InviteButton organizationId={mockOrganizationId} />);

    // Open dialog
    fireEvent.click(screen.getByRole("button", { name: /invite member/i }));

    await waitFor(() => {
      expect(screen.getByText("Invite a team member")).toBeInTheDocument();
    });

    // Try to submit without email (form should prevent submission)
    const submitButton = screen.getByRole("button", {
      name: /send invitation/i,
    });
    fireEvent.click(submitButton);

    // Since the form has required validation, the toast might not be called
    // Instead, check that the form validation works
    const emailInput = screen.getByLabelText(/email address/i);
    expect(emailInput).toHaveAttribute("required");
  });

  it("successfully sends invitation", async () => {
    const { inviteUserAction } = await import(
      "@app/workspace/[workspaceId]/_actions"
    );
    const { toast } = await import("sonner");

    vi.mocked(inviteUserAction).mockResolvedValue({
      success: true,
      invitationId: "inv-123",
    });

    render(<InviteButton organizationId={mockOrganizationId} />);

    // Open dialog
    fireEvent.click(screen.getByRole("button", { name: /invite member/i }));

    await waitFor(() => {
      expect(screen.getByText("Invite a team member")).toBeInTheDocument();
    });

    // Fill form
    const emailInput = screen.getByLabelText(/email address/i);
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    // Submit form
    fireEvent.click(screen.getByRole("button", { name: /send invitation/i }));

    await waitFor(() => {
      expect(inviteUserAction).toHaveBeenCalledWith({
        email: "test@example.com",
        role: "member",
        organizationId: mockOrganizationId,
      });
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Invitation sent successfully!"
      );
    });
  });

  it("handles invitation errors", async () => {
    const { inviteUserAction } = await import(
      "@app/workspace/[workspaceId]/_actions"
    );
    const { toast } = await import("sonner");

    vi.mocked(inviteUserAction).mockResolvedValue({
      success: false,
      error: "User is already a member",
    });

    render(<InviteButton organizationId={mockOrganizationId} />);

    // Open dialog
    fireEvent.click(screen.getByRole("button", { name: /invite member/i }));

    await waitFor(() => {
      expect(screen.getByText("Invite a team member")).toBeInTheDocument();
    });

    // Fill form
    const emailInput = screen.getByLabelText(/email address/i);
    fireEvent.change(emailInput, { target: { value: "existing@example.com" } });

    // Submit form
    fireEvent.click(screen.getByRole("button", { name: /send invitation/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("User is already a member");
    });
  });

  it("allows role selection", async () => {
    render(<InviteButton organizationId={mockOrganizationId} />);

    // Open dialog
    fireEvent.click(screen.getByRole("button", { name: /invite member/i }));

    await waitFor(() => {
      expect(screen.getByText("Invite a team member")).toBeInTheDocument();
    });

    // Check that role selector is present
    const roleSelect = screen.getByRole("combobox");
    expect(roleSelect).toBeInTheDocument();

    // Check default value is "member"
    expect(roleSelect).toHaveTextContent("Member");
  });

  it("shows loading state during submission", async () => {
    const { inviteUserAction } = await import(
      "@app/workspace/[workspaceId]/_actions"
    );

    // Mock a delayed response
    vi.mocked(inviteUserAction).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () => resolve({ success: true, invitationId: "inv-123" }),
            100
          )
        )
    );

    render(<InviteButton organizationId={mockOrganizationId} />);

    // Open dialog
    fireEvent.click(screen.getByRole("button", { name: /invite member/i }));

    await waitFor(() => {
      expect(screen.getByText("Invite a team member")).toBeInTheDocument();
    });

    // Fill form
    const emailInput = screen.getByLabelText(/email address/i);
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    // Submit form
    fireEvent.click(screen.getByRole("button", { name: /send invitation/i }));

    // Check loading state
    expect(screen.getByText("Sending...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sending/i })).toBeDisabled();

    // Wait for completion
    await waitFor(() => {
      expect(screen.queryByText("Sending...")).not.toBeInTheDocument();
    });
  });
});
