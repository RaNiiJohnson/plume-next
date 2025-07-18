import { PageLayout } from "@/components/layout";
import { PropsWithChildren } from "react";

export default function layout(props: PropsWithChildren) {
  return <PageLayout>{props.children}</PageLayout>;
}
