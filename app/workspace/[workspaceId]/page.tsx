import { redirect } from "next/navigation";

type Pageprops = {
  params: Promise<{ workspaceId: string }>;
};

export default async function WorkspacePage(props: Pageprops) {
  const params = await props.params;

  // Redirect to boards by default
  redirect(`/workspace/${params.workspaceId}/boards`);
}
