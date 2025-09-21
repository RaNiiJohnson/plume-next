import { Badge } from "@/components/ui/badge";
import { Task } from "@/lib/types/type";

type TaskOverlayProps = {
  task: Task;
  width?: number;
};

export default function TaskOverlay({ task, width }: TaskOverlayProps) {
  const predefinedTags = [
    { name: "urgent", color: "bg-red-500" },
    { name: "important", color: "bg-orange-500" },
    { name: "bug", color: "bg-red-600" },
    { name: "feature", color: "bg-blue-500" },
    { name: "enhancement", color: "bg-green-500" },
    { name: "documentation", color: "bg-purple-500" },
    { name: "testing", color: "bg-yellow-700" },
    { name: "review", color: "bg-indigo-500" },
  ];

  const getTagColor = (tagName: string) => {
    const predefined = predefinedTags.find((tag) => tag.name === tagName);
    return predefined?.color || "bg-gray-500";
  };

  return (
    <div
      className="border border-muted p-3 rounded-sm shadow-sm hover:bg-accent cursor-grabbing select-none"
      style={width ? { width } : undefined}
    >
      {task.content}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {task.tags.slice(0, 3).map((tag, index) => (
            <Badge
              key={index}
              className={`${getTagColor(
                tag
              )} text-white cursor-pointer text-xs px-2 py-0.5`}
            >
              {tag}
            </Badge>
          ))}
          {task.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{task.tags.length - 3}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
