export default function TaskOverlay({
  task,
}: {
  task: { id: string; content: string };
}) {
  return <div className="  rounded-md p-3 shadow-md">{task.content}</div>;
}
