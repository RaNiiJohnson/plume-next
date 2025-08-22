import { InvitationsList, InviteButton, MembersList } from "../_components";

type MembersPageProps = {
  params: Promise<{ workspaceId: string }>;
};

export default async function MembersPage({ params }: MembersPageProps) {
  const { workspaceId } = await params;

  return (
    <div className="space-y-6">
      <InvitationsList organizationId={workspaceId} />

      <MembersList organizationId={workspaceId} />

      <div className="flex justify-center pt-8">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20 shadow-sm">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-primary mb-2">
              Invite Team Members
            </h3>
            <p className="text-sm text-muted-foreground">
              Collaborate with your team by inviting them to this workspace
            </p>
          </div>
          <InviteButton organizationId={workspaceId} />
        </div>
      </div>
    </div>
  );
}
