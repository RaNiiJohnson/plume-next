import { InvitationsList, InviteSection, MembersList } from "../_components";

type MembersPageProps = {
  params: Promise<{ workspaceId: string }>;
};

export default async function MembersPage({ params }: MembersPageProps) {
  const { workspaceId } = await params;

  return (
    <div className="space-y-6">
      <InvitationsList organizationId={workspaceId} />

      <MembersList organizationId={workspaceId} />

      <InviteSection organizationId={workspaceId} />
    </div>
  );
}
