import { Metadata } from "next";
import { Mail, MessageCircle, Book, HelpCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Support - Plume",
  description: "Get help and support for Plume productivity platform",
};

export default function SupportPage() {
  return (
    <div className="container mx-auto px-6 py-12 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Support Center</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Need help? We&apos;re here to assist you. Choose the best way to get
          support for your needs.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Email Support</CardTitle>
            <CardDescription>
              Get personalized help from our support team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Response time: Within 24 hours
            </p>
            <Button asChild className="w-full">
              <a href="mailto:support@plume.com">Contact Support</a>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <MessageCircle className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Live Chat</CardTitle>
            <CardDescription>
              Chat with our support team in real-time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Available: Mon-Fri, 9AM-6PM EST
            </p>
            <Button variant="outline" className="w-full">
              Start Chat
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Book className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Documentation</CardTitle>
            <CardDescription>
              Browse our comprehensive guides and tutorials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Self-service help articles
            </p>
            <Button variant="outline" className="w-full">
              View Docs
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="bg-muted/50 rounded-lg p-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <HelpCircle className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold mb-4">
              Frequently Asked Questions
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">
                  How do I create a new workspace?
                </h3>
                <p className="text-muted-foreground">
                  You can create a new workspace by clicking the &quot;+&quot;
                  button in the sidebar and selecting &quot;New Workspace&quot;.
                  Give it a name and you&apos;re ready to go!
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-2">
                  Can I invite team members to my workspace?
                </h3>
                <p className="text-muted-foreground">
                  Yes! Go to your workspace settings and click &quot;Invite
                  Members&quot;. You can send invitations via email to
                  collaborate with your team.
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-2">
                  How do I organize my tasks and projects?
                </h3>
                <p className="text-muted-foreground">
                  Use boards to organize your projects, create columns for
                  different stages, and add tasks with tags, due dates, and
                  descriptions to stay organized.
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Is my data secure?</h3>
                <p className="text-muted-foreground">
                  Absolutely! We use industry-standard encryption and security
                  measures to protect your data. Check our Privacy Policy for
                  more details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
