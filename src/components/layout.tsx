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

export const SecondPageLayout = (props: PropsWithChildren) => {
  return (
    <div className="p-4 bg-muted h-full flex flex-col">{props.children}</div>
  );
};
