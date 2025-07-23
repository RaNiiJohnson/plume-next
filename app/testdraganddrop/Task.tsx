import React from "react";

interface TaskProps {
  content: string;
}

export default function Task({ content }: TaskProps) {
  return (
    <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 transition-all">
      {content}
    </div>
  );
}
