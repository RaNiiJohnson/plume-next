"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Link, Settings } from "lucide-react";
import { Organization } from "@/generated/prisma";
import { updateWorkspace } from "./setting.action";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function EditWorkspace({
  organization,
}: {
  organization: Organization;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const logo = formData.get("logo") as string;

    if (!name.trim()) {
      setError("Workspace name is required");
      return;
    }

    if (!slug.trim()) {
      setError("Workspace slug is required");
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await updateWorkspace({
        name: name.trim(),
        slug: slug.trim(),
        logo: logo.trim() || undefined,
        workspaceId: organization.id,
      });

      if (result.success) {
        router.refresh();
      } else {
        setError(result.error || "Failed to update workspace");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {/* Name & Slug côte à côte */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="flex items-center gap-2 text-sm font-medium"
              >
                <Building2 className="w-4 h-4 text-muted-foreground" />
                Workspace Name
              </Label>
              <Input
                id="name"
                name="name"
                defaultValue={organization.name}
                placeholder="Enter organization name"
                className="transition-all focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="slug"
                className="flex items-center gap-2 text-sm font-medium"
              >
                <Link className="w-4 h-4 text-muted-foreground" />
                Workspace Slug
              </Label>
              <div className="relative">
                <Input
                  id="slug"
                  name="slug"
                  defaultValue={organization.slug || ""}
                  placeholder="Enter workspace slug"
                  className="transition-all focus:ring-2 focus:ring-primary/20 pl-10"
                  required
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  /
                </span>
              </div>
            </div>
          </div>

          {/* Logo Section */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2 text-sm font-medium">
              Workspace Logo
            </Label>
            {/* Preview du logo */}
            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
              <Avatar className="w-16 h-16">
                <AvatarImage
                  src={organization.logo || ""}
                  alt="Workspace logo"
                />
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                  {organization.name?.charAt(0)?.toUpperCase() || "W"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">Current Logo</p>
                <p className="text-xs text-muted-foreground">
                  {organization.logo
                    ? "Custom logo uploaded"
                    : "Using default avatar"}
                </p>
              </div>
            </div>
            {/* Input pour le logo */}
            <div className="space-y-2">
              <Input
                id="logo"
                name="logo"
                defaultValue={organization.logo || ""}
                placeholder="Enter logo URL or upload image"
                className="transition-all focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-xs text-muted-foreground">
                Paste an image URL or upload a file. Recommended size: 120x120px
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="submit" className="px-6" disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
