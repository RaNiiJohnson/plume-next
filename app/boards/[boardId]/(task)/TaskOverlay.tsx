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
      className="bg-background border border-muted p-3 rounded-lg shadow-sm hover:bg-accent cursor-pointer select-none"
      style={width ? { width } : undefined}
    >
      {task.content}
    </div>
  );
}
