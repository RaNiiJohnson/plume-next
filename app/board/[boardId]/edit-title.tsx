"use client";

import { cn } from "@/lib/utils";
import { Check, Edit } from "lucide-react";
import { useOptimistic, useRef, useState, useTransition } from "react";

export const UpdateTitleForm = (props: {
  children: string;
  onTitleChange?: (newTitle: string) => void;
  className?: string;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useOptimistic(
    props.children, // valeur par defaut
    (_, newTitle: string) => newTitle // reducer
  );

  const submit = () => {
    setIsEditing(false);
    const newTitle = ref.current?.value ?? "";
    props.onTitleChange?.(newTitle);
    startTransition(() => {
      setTitle(newTitle);
    });
  };

  if (isEditing)
    return (
      <div className="group flex items-center gap-2">
        <input
          ref={ref}
          defaultValue={props.children}
          className={cn(props.className)}
          style={{
            // @ts-expect-error - new field api
            fieldSizing: "content",
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              submit();
            }
          }}
        />
        <button
          className="group-hover:opacity-100 opacity-0 p-3 cursor-pointer"
          onClick={() => {
            submit();
          }}
        >
          <Check size={16} />
        </button>
      </div>
    );

  return (
    <div className="group flex items-center gap-2">
      <p className={cn(props.className, { "animate-pulse": isPending })}>
        {title}
      </p>
      <button
        className="group-hover:opacity-100 opacity-0 p-3 cursor-pointer"
        onClick={() => {
          setIsEditing(true);
          setTimeout(() => {
            ref.current?.focus();
          }, 100);
        }}
      >
        <Edit size={16} />
      </button>
    </div>
  );
};
