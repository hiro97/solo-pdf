import type { Metadata } from "next"
import { Shield, Server, Database, Eye, Lock, CheckCircle } from "lucide-react"
import { PageHero } from "@/components/marketing/Hero"
import { MotionInView } from "@/components/marketing/MotionInView"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { siteConfig } from "@/lib/site"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "SOLO PDF Privacy Policy. Zero Upload policy ensures your files are never sent to any server.",
  keywords: ["privacy policy", "data protection", "zero upload", "file privacy"],
  openGraph: {
    title: "Privacy Policy - SOLO PDF",
    description: "Zero Upload. Your files are never sent to any server.",
    url: `${siteConfig.url}/privacy`,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Privacy Policy",
    description: "SOLO PDF Privacy Policy",
  },
  alternates: {
    canonical: `${siteConfig.url}/privacy`,
  },
}

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        title="Privacy Policy"
        subtitle="Your privacy is our top priority"
        ctaText="Edit PDF"
      />

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[{ label: "Privacy Policy", href: "/privacy" }]}
          className="mb-8"
        />

        {/* Zero Upload Commitment */}
        <MotionInView>
          <Card className="mb-12 border-primary/50 bg-primary/5">
            <CardHeader className="flex flex-row items-center gap-4">
              <Shield className="h-10 w-10 text-primary" />
              <div>
                <CardTitle className="text-2xl">Zero Server Upload Promise</CardTitle>
                <p className="text-muted-foreground">Our Core Privacy Commitment</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg font-medium">
                SOLO PDF never sends your files to any server.
              </p>
              <ul className="space-y-2">
                {[
                  "All PDF processing is done in your browser using JavaScript/WebAssembly",
                  "File data is never transmitted over the internet",
                  "All temporary data is deleted when you close your browser",
                  "You can verify this by checking your browser's Network tab",
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </MotionInView>

        <div className="space-y-12">
          {/* What We DON'T Collect */}
          <MotionInView>
            <section>
              <div className="mb-6 flex items-center gap-3">
                <Server className="h-6 w-6 text-muted-foreground" />
                <h2 className="text-2xl font-bold">Information We Do NOT Collect</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>We do not collect the following information:</p>
                <ul className="list-inside list-disc space-y-1 pl-4">
                  <li>Your PDF file contents</li>
                  <li>File names or metadata</li>
                  <li>Edits or signature images</li>
                  <li>Personal identification information (no registration required)</li>
                </ul>
              </div>
            </section>
          </MotionInView>

          {/* What We Store Locally */}
          <MotionInView>
            <section>
              <div className="mb-6 flex items-center gap-3">
                <Database className="h-6 w-6 text-muted-foreground" />
                <h2 className="text-2xl font-bold">Information Stored Locally</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  For your convenience, the following information may be stored in your browser's local storage:
                </p>
                <ul className="list-inside list-disc space-y-1 pl-4">
                  <li>Theme settings (light/dark mode)</li>
                  <li>Language preferences</li>
                  <li>Recently used tool settings (optional)</li>
                </ul>
                <p className="mt-4">
                  This information is stored only on your device and is never sent to any server.
                  You can delete it anytime through your browser settings.
                </p>
              </div>
            </section>
          </MotionInView>

          {/* Analytics */}
          <MotionInView>
            <section>
              <div className="mb-6 flex items-center gap-3">
                <Eye className="h-6 w-6 text-muted-foreground" />
                <h2 className="text-2xl font-bold">Analytics and Cookies</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>We may collect the following anonymous analytics data to improve our service:</p>
                <ul className="list-inside list-disc space-y-1 pl-4">
                  <li>Page visit counts</li>
                  <li>Features used</li>
                  <li>Browser type and device type</li>
                  <li>Approximate location (country level)</li>
                </ul>
                <p className="mt-4">
                  This data cannot identify you personally and is unrelated to your file contents.
                </p>
              </div>
            </section>
          </MotionInView>

          {/* AI Features (Future) */}
          <MotionInView>
            <section>
              <div className="mb-6 flex items-center gap-3">
                <Lock className="h-6 w-6 text-muted-foreground" />
                <h2 className="text-2xl font-bold">AI Features (Future Plans)</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>If AI-based features are added in the future:</p>
                <ul className="list-inside list-disc space-y-1 pl-4">
                  <li>Only text you select will be used for processing</li>
                  <li>Explicit consent will be requested before AI processing</li>
                  <li>API keys will be managed by you</li>
                  <li>AI provider's privacy policy will apply separately</li>
                </ul>
              </div>
            </section>
          </MotionInView>

          {/* Changes */}
          <MotionInView>
            <section>
              <h2 className="mb-4 text-2xl font-bold">Policy Changes</h2>
              <p className="text-muted-foreground">
                This privacy policy may be updated. We will notify you of significant changes
                through our website. Last updated: December 2024
              </p>
            </section>
          </MotionInView>

          {/* Contact */}
          <MotionInView>
            <section>
              <h2 className="mb-4 text-2xl font-bold">Contact</h2>
              <p className="text-muted-foreground">
                For privacy-related inquiries, please contact us at{" "}
                <a
                  href="mailto:jonghyun.captureall@gmail.com"
                  className="text-primary hover:underline"
                >
                  jonghyun.captureall@gmail.com
                </a>
              </p>
            </section>
          </MotionInView>
        </div>
      </div>
    </>
  )
}
