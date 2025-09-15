import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  acceptInvitationAction,
  declineInvitationAction,
} from "@app/invite/[invitationId]/invitation.action";

// Mock des dépendances
vi.mock("@/lib/auth-server", () => ({
  getSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      acceptInvitation: vi.fn(),
      rejectInvitation: vi.fn(),
    },
  },
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    invitation: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    member: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(() => Promise.resolve({})),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

describe("Invitation Actions", () => {
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
      name: "Test User",
      email: "invited@test.com",
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      image: null,
    },
  };

  const mockInvitation = {
    id: "invitation-1",
    email: "invited@test.com",
    status: "pending" as const,
    organizationId: "org-1",
    role: "member",
    inviterId: "inviter-1",
    check: false,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h dans le futur
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Supprimer les logs d'erreur pendant les tests
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("acceptInvitationAction", () => {
    it("should successfully accept a valid invitation", async () => {
      // Setup mocks
      const { getSession } = await import("@/lib/auth-server");
      const { auth } = await import("@/lib/auth");
      const prisma = (await import("@/lib/prisma")).default;
      const { redirect } = await import("next/navigation");

      vi.mocked(getSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.invitation.findUnique).mockResolvedValue(mockInvitation);
      vi.mocked(prisma.member.findFirst).mockResolvedValue(null);
      vi.mocked(auth.api.acceptInvitation).mockResolvedValue({
        invitation: mockInvitation,
        member: {
          id: "member-1",
          userId: "user-1",
          organizationId: "org-1",
          role: "member",
          createdAt: new Date(),
        },
      });

      // Execute
      await acceptInvitationAction({ invitationId: "invitation-1" });

      // Verify
      expect(auth.api.acceptInvitation).toHaveBeenCalledWith({
        body: { invitationId: "invitation-1" },
        headers: {},
      });
      expect(redirect).toHaveBeenCalledWith("/workspace/org-1");
    });

    it("should handle existing member case", async () => {
      // Setup mocks
      const { getSession } = await import("@/lib/auth-server");
      const prisma = (await import("@/lib/prisma")).default;
      const { redirect } = await import("next/navigation");

      vi.mocked(getSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.invitation.findUnique).mockResolvedValue(mockInvitation);
      vi.mocked(prisma.member.findFirst).mockResolvedValue({
        id: "member-1",
        userId: "user-1",
        organizationId: "org-1",
        role: "member",
        createdAt: new Date(),
      });
      vi.mocked(prisma.invitation.update).mockResolvedValue(mockInvitation);

      // Execute
      await acceptInvitationAction({ invitationId: "invitation-1" });

      // Verify
      expect(prisma.invitation.update).toHaveBeenCalledWith({
        where: { id: "invitation-1" },
        data: { status: "accepted" },
      });
      expect(redirect).toHaveBeenCalledWith("/workspace/org-1");
    });

    it("should reject unauthorized requests", async () => {
      // Setup mocks
      const { getSession } = await import("@/lib/auth-server");
      vi.mocked(getSession).mockResolvedValue(null);

      // Execute & Verify
      await expect(
        acceptInvitationAction({ invitationId: "invitation-1" })
      ).rejects.toThrow("Unauthorized");
    });

    it("should reject invalid invitations", async () => {
      // Setup mocks
      const { getSession } = await import("@/lib/auth-server");
      const prisma = (await import("@/lib/prisma")).default;

      vi.mocked(getSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.invitation.findUnique).mockResolvedValue(null);

      // Execute & Verify
      await expect(
        acceptInvitationAction({ invitationId: "invitation-1" })
      ).rejects.toThrow("Invalid invitation");
    });

    it("should reject expired invitations", async () => {
      // Setup mocks
      const { getSession } = await import("@/lib/auth-server");
      const prisma = (await import("@/lib/prisma")).default;

      const expiredInvitation = {
        ...mockInvitation,
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24h dans le passé
      };

      vi.mocked(getSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.invitation.findUnique).mockResolvedValue(
        expiredInvitation
      );

      // Execute & Verify
      await expect(
        acceptInvitationAction({ invitationId: "invitation-1" })
      ).rejects.toThrow("Invitation expired");
    });

    it("should reject email mismatch", async () => {
      // Setup mocks
      const { getSession } = await import("@/lib/auth-server");
      const prisma = (await import("@/lib/prisma")).default;

      const wrongEmailSession = {
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
          name: "Wrong User",
          email: "wrong@test.com",
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          image: null,
        },
      };

      vi.mocked(getSession).mockResolvedValue(wrongEmailSession);
      vi.mocked(prisma.invitation.findUnique).mockResolvedValue(mockInvitation);

      // Execute & Verify
      await expect(
        acceptInvitationAction({ invitationId: "invitation-1" })
      ).rejects.toThrow("Invitation email mismatch");
    });
  });

  describe("declineInvitationAction", () => {
    it("should successfully decline a valid invitation", async () => {
      // Setup mocks
      const { getSession } = await import("@/lib/auth-server");
      const { auth } = await import("@/lib/auth");
      const prisma = (await import("@/lib/prisma")).default;
      const { redirect } = await import("next/navigation");

      vi.mocked(getSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.invitation.findUnique).mockResolvedValue(mockInvitation);
      vi.mocked(auth.api.rejectInvitation).mockResolvedValue({
        invitation: mockInvitation,
        member: null,
      });

      // Execute
      await declineInvitationAction({ invitationId: "invitation-1" });

      // Verify
      expect(auth.api.rejectInvitation).toHaveBeenCalledWith({
        body: { invitationId: "invitation-1" },
        headers: {},
      });
      expect(redirect).toHaveBeenCalledWith("/");
    });

    it("should reject unauthorized decline requests", async () => {
      // Setup mocks
      const { getSession } = await import("@/lib/auth-server");
      vi.mocked(getSession).mockResolvedValue(null);

      // Execute & Verify
      await expect(
        declineInvitationAction({ invitationId: "invitation-1" })
      ).rejects.toThrow("Unauthorized");
    });

    it("should reject invalid invitations for decline", async () => {
      // Setup mocks
      const { getSession } = await import("@/lib/auth-server");
      const prisma = (await import("@/lib/prisma")).default;

      vi.mocked(getSession).mockResolvedValue(mockSession);
      vi.mocked(prisma.invitation.findUnique).mockResolvedValue({
        ...mockInvitation,
        status: "accepted",
      });

      // Execute & Verify
      await expect(
        declineInvitationAction({ invitationId: "invitation-1" })
      ).rejects.toThrow("Invalid invitation");
    });
  });
});
