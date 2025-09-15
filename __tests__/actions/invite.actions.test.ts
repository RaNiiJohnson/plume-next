import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  inviteUserAction,
  cancelInvitationAction,
} from "@app/workspace/[workspaceId]/_actions/invite.actions";

// Mock des dépendances
vi.mock("@/lib/auth-server", () => ({
  getSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      createInvitation: vi.fn(),
      cancelInvitation: vi.fn(),
    },
  },
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
    member: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(() => Promise.resolve({})),
}));

describe("Invite Actions", () => {
  const mockSession = {
    session: {
      id: "session-1",
      token: "token-123",
      userId: "user-1",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
      ipAddress: "127.0.0.1",
      userAgent: "test-agent",
      activeOrganizationId: "org-1",
    },
    user: {
      id: "user-1",
      name: "Admin User",
      email: "admin@test.com",
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      image: null,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Supprimer les logs d'erreur pendant les tests
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("inviteUserAction", () => {
    it("should successfully invite a new user", async () => {
      // Setup mocks
      const { getSession } = await import("@/lib/auth-server");
      const { auth } = await import("@/lib/auth");
      const prisma = (await import("@/lib/prisma")).default;

      vi.mocked(getSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(auth.api.createInvitation).mockResolvedValue({
        id: "invitation-1",
        email: "newuser@test.com",
        role: "member",
        status: "pending" as const,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        organizationId: "org-1",
        inviterId: "user-1",
      });

      // Execute
      const result = await inviteUserAction({
        email: "newuser@test.com",
        role: "member",
        organizationId: "org-1",
      });

      // Verify
      expect(result.success).toBe(true);
      expect(result.invitationId).toBe("invitation-1");
      expect(auth.api.createInvitation).toHaveBeenCalledWith({
        body: {
          email: "newuser@test.com",
          role: "member",
          organizationId: "org-1",
          resend: true,
        },
        headers: {},
      });
    });

    it("should reject invitation for existing member", async () => {
      // Setup mocks
      const { getSession } = await import("@/lib/auth-server");
      const prisma = (await import("@/lib/prisma")).default;

      vi.mocked(getSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "existing-user",
        name: "Existing User",
        email: "existing@test.com",
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        image: null,
      });
      vi.mocked(prisma.member.findFirst).mockResolvedValue({
        id: "member-1",
        userId: "existing-user",
        organizationId: "org-1",
        role: "member",
        createdAt: new Date(),
      });

      // Execute
      const result = await inviteUserAction({
        email: "existing@test.com",
        role: "member",
        organizationId: "org-1",
      });

      // Verify
      expect(result.success).toBe(false);
      expect(result.error).toBe(
        "User is already a member of this organization"
      );
    });

    it("should reject unauthorized requests", async () => {
      // Setup mocks
      const { getSession } = await import("@/lib/auth-server");
      vi.mocked(getSession).mockResolvedValue(null);

      // Execute
      const result = await inviteUserAction({
        email: "test@test.com",
        role: "member",
        organizationId: "org-1",
      });

      // Verify
      expect(result.success).toBe(false);
      expect(result.error).toBe("Unauthorized");
    });

    it("should handle API errors gracefully", async () => {
      // Setup mocks
      const { getSession } = await import("@/lib/auth-server");
      const { auth } = await import("@/lib/auth");
      const prisma = (await import("@/lib/prisma")).default;

      vi.mocked(getSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(auth.api.createInvitation).mockRejectedValue(
        new Error("API Error")
      );

      // Execute
      const result = await inviteUserAction({
        email: "test@test.com",
        role: "member",
        organizationId: "org-1",
      });

      // Verify
      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to send invitation");
    });
  });

  describe("cancelInvitationAction", () => {
    it("should successfully cancel an invitation", async () => {
      // Setup mocks
      const { getSession } = await import("@/lib/auth-server");
      const { auth } = await import("@/lib/auth");

      vi.mocked(getSession).mockResolvedValue(mockSession);
      vi.mocked(auth.api.cancelInvitation).mockResolvedValue({
        id: "invitation-1",
        email: "test@test.com",
        role: "member",
        status: "canceled" as const,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        organizationId: "org-1",
        inviterId: "user-1",
      });

      // Execute
      const result = await cancelInvitationAction({
        invitationId: "invitation-1",
      });

      // Verify
      expect(result.success).toBe(true);
      expect(auth.api.cancelInvitation).toHaveBeenCalledWith({
        body: { invitationId: "invitation-1" },
        headers: {},
      });
    });

    it("should reject unauthorized cancellation", async () => {
      // Setup mocks
      const { getSession } = await import("@/lib/auth-server");
      vi.mocked(getSession).mockResolvedValue(null);

      // Execute
      const result = await cancelInvitationAction({
        invitationId: "invitation-1",
      });

      // Verify
      expect(result.success).toBe(false);
      expect(result.error).toBe("Unauthorized");
    });
  });
});
