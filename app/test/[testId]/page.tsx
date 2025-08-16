// test/[testId]/page.tsx
export default async function TestPage({
  params,
}: {
  params: { testId: string };
}) {
  const { testId } = await params;

  // Si testId est "all" ou "index", montrer la vue générale
  if (testId === "all") {
    return <div>Vue générale des tests</div>;
  }

  // Sinon, montrer le détail pour cet ID
  return <div>Détail pour : {testId}</div>;
}
