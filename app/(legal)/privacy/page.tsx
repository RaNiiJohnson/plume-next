import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Plume",
  description: "Privacy policy for Plume productivity platform",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl">
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

        <p className="text-lg text-muted-foreground mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Information We Collect
          </h2>
          <p className="mb-4">
            We collect information you provide directly to us, such as when you
            create an account, use our services, or contact us for support.
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Account information (name, email address)</li>
            <li>Workspace and project data</li>
            <li>Usage analytics and performance data</li>
            <li>Communication preferences</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            How We Use Your Information
          </h2>
          <p className="mb-4">
            We use the information we collect to provide, maintain, and improve
            our services:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>To provide and operate our productivity platform</li>
            <li>To communicate with you about your account and our services</li>
            <li>To improve and personalize your experience</li>
            <li>To ensure security and prevent fraud</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
          <p className="mb-4">
            We implement appropriate technical and organizational measures to
            protect your personal information against unauthorized access,
            alteration, disclosure, or destruction.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
          <p className="mb-4">
            You have the right to access, update, or delete your personal
            information. You can manage your account settings or contact us for
            assistance.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact
            us at{" "}
            <a
              href="mailto:privacy@plume.com"
              className="text-primary hover:underline"
            >
              privacy@plume.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
