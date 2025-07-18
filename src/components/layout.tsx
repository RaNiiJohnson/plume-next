import { PropsWithChildren } from "react";

export const PageLayout = (props: PropsWithChildren) => {
  return (
    <div
      className="flex flex-col p-4 gap-4 min-h-full max-w-md mx-auto border-x
    "
    >
      {props.children}
    </div>
  );
};
