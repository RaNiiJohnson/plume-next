interface TaskOverlayProps {
  task: {
    id: string;
    content: string;
  };
  width?: number;
}

export default function TaskOverlay({ task, width }: TaskOverlayProps) {
  return (
    <div
      className="rounded-md p-3 shadow-md bg-card"
      style={width ? { width } : undefined}
    >
      {task.content}
    </div>
  );
}
