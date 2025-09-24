import { Badge } from "@/components/ui/badge";
import { Task } from "@/lib/types/type";

type TaskOverlayProps = {
  task: Task;
  width?: number;
};

export default function TaskOverlay({ task, width }: TaskOverlayProps) {
  const predefinedTags = [
    { name: "urgent", color: "bg-gradient-to-r from-red-500 to-red-600" },
    {
      name: "important",
      color: "bg-gradient-to-r from-orange-500 to-orange-600",
    },
    { name: "bug", color: "bg-gradient-to-r from-red-600 to-red-700" },
    { name: "feature", color: "bg-gradient-to-r from-blue-500 to-blue-600" },
    {
      name: "enhancement",
      color: "bg-gradient-to-r from-green-500 to-green-600",
    },
    {
      name: "documentation",
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
    },
    {
      name: "testing",
      color: "bg-gradient-to-r from-yellow-600 to-yellow-700",
    },
    { name: "review", color: "bg-gradient-to-r from-indigo-500 to-indigo-600" },
    { name: "design", color: "bg-gradient-to-r from-pink-500 to-pink-600" },
    { name: "backend", color: "bg-gradient-to-r from-gray-600 to-gray-700" },
    { name: "frontend", color: "bg-gradient-to-r from-cyan-500 to-cyan-600" },
    { name: "api", color: "bg-gradient-to-r from-teal-500 to-teal-600" },
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
