"use client";

import { PageLayout } from "@/components/layout";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return <PageLayout></PageLayout>;
}
