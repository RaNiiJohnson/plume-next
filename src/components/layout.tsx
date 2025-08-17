import { PropsWithChildren } from "react";

export const PageLayout = (props: PropsWithChildren) => {
  return (
    <div className="flex flex-col max-w-lg min-h-full mx-auto border-x">
      <div className="p-4 gap-4 flex-1 flex flex-col">{props.children}</div>
    </div>
  );
};

export const SecondPageLayout = (props: PropsWithChildren) => {
  return (
    <div className="mx-auto h-full flex flex-col bg-background/80">
      <div className="p-4 border-t-3 border-primary flex-1 flex flex-col">
        {props.children}
      </div>
    </div>
  );
};

export const ThirdPageLayout = (props: PropsWithChildren) => {
  return (
    <div className="mx-auto h-full flex flex-col">
      <div className="p-4 border-t-3 border-primary flex-1 flex flex-col">
        {props.children}
      </div>
    </div>
  );
};
