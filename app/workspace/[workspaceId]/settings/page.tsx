import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import prisma from "@/lib/prisma";
import { Settings, Users, Calendar, Shield } from "lucide-react";

type SettingsPageProps = {
  params: Promise<{ workspaceId: string }>;
};

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { workspaceId } = await params;

  const organization = await prisma.organization.findUnique({
    where: { id: workspaceId },
    include: {
      _count: {
        select: {
          members: true,
          Board: true,
        },
      },
    },
  });

  if (!organization) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-2">Organization not found</h1>
        <p className="text-muted-foreground">
          The organization you're looking for doesn't exist.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Organization Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Organization Settings
          </CardTitle>
          <CardDescription>
            Manage your organization's basic information and settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                defaultValue={organization.name}
                placeholder="Enter organization name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <Input
                id="slug"
                defaultValue={organization.slug || ""}
                placeholder="organization-slug"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button>Save Changes</Button>
          </div>
        </CardContent>
      </Card>

      {/* Organization Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Organization Overview
          </CardTitle>
          <CardDescription>
            Key statistics about your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-primary">
                {organization._count.members}
              </div>
              <div className="text-sm text-muted-foreground">Total Members</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-primary">
                {organization._count.Board}
              </div>
              <div className="text-sm text-muted-foreground">Active Boards</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-primary">
                {new Date(organization.createdAt).toLocaleDateString()}
              </div>
              <div className="text-sm text-muted-foreground">Created</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/20 bg-destructive/5">
            <div>
              <h4 className="font-medium text-destructive">
                Delete Organization
              </h4>
              <p className="text-sm text-muted-foreground">
                Permanently delete this organization and all its data
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
