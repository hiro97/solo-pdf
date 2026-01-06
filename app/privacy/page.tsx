import type { Metadata } from "next"
import { Shield, Server, Database, Eye, Lock, CheckCircle } from "lucide-react"
import { PageHero } from "@/components/marketing/Hero"
import { MotionInView } from "@/components/marketing/MotionInView"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"
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

// Section component with green accent icon
function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="mb-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[hsl(var(--free)/0.1)] border border-[hsl(var(--free)/0.2)]
                        flex items-center justify-center">
          <Icon className="h-5 w-5 text-[hsl(var(--free))]" />
        </div>
        <h2 className="text-xl font-serif font-medium">{title}</h2>
      </div>
      {children}
    </section>
  )
}

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        title="Privacy Policy"
        subtitle="Your privacy is our top priority"
        ctaText="Edit PDF"
      />

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[{ label: "Privacy Policy", href: "/privacy" }]}
          className="mb-8"
        />

        {/* Zero Upload Commitment */}
        <MotionInView>
          <div className="mb-10 rounded-2xl p-6 md:p-8
                          border border-[hsl(var(--free)/0.3)]
                          bg-gradient-to-br from-[hsl(var(--free)/0.05)] via-[hsl(var(--free)/0.08)] to-[hsl(var(--free)/0.02)]">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-xl bg-[hsl(var(--free))] flex items-center justify-center
                              shadow-[0_0_20px_hsl(var(--free-glow))]">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-serif font-medium">Zero Server Upload Promise</h2>
                <p className="text-xs font-mono uppercase tracking-wider text-[hsl(var(--free))] mt-1">
                  Our Core Privacy Commitment
                </p>
              </div>
            </div>

            <p className="text-base font-medium mb-4">
              SOLO PDF never sends your files to any server.
            </p>

            <ul className="space-y-2.5">
              {[
                "All PDF processing is done in your browser using JavaScript/WebAssembly",
                "File data is never transmitted over the internet",
                "All temporary data is deleted when you close your browser",
                "You can verify this by checking your browser's Network tab",
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-2.5">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--free))]" />
                  <span className="text-sm text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </MotionInView>

        <div className="space-y-10">
          {/* What We DON'T Collect */}
          <MotionInView>
            <Section icon={Server} title="Information We Do NOT Collect">
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>We do not collect the following information:</p>
                <ul className="space-y-2 pl-1">
                  {[
                    "Your PDF file contents",
                    "File names or metadata",
                    "Edits or signature images",
                    "Personal identification information (no registration required)",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--free))] shrink-0
                                       shadow-[0_0_6px_hsl(var(--free-glow))]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Section>
          </MotionInView>

          {/* What We Store Locally */}
          <MotionInView>
            <Section icon={Database} title="Information Stored Locally">
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  For your convenience, the following information may be stored in your browser's local storage:
                </p>
                <ul className="space-y-2 pl-1">
                  {[
                    "Theme settings (light/dark mode)",
                    "Language preferences",
                    "Recently used tool settings (optional)",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--free))] shrink-0
                                       shadow-[0_0_6px_hsl(var(--free-glow))]" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 pt-4 border-t border-border/50">
                  This information is stored only on your device and is never sent to any server.
                  You can delete it anytime through your browser settings.
                </p>
              </div>
            </Section>
          </MotionInView>

          {/* Analytics */}
          <MotionInView>
            <Section icon={Eye} title="Analytics and Cookies">
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>We may collect the following anonymous analytics data to improve our service:</p>
                <ul className="space-y-2 pl-1">
                  {[
                    "Page visit counts",
                    "Features used",
                    "Browser type and device type",
                    "Approximate location (country level)",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--free))] shrink-0
                                       shadow-[0_0_6px_hsl(var(--free-glow))]" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 pt-4 border-t border-border/50">
                  This data cannot identify you personally and is unrelated to your file contents.
                </p>
              </div>
            </Section>
          </MotionInView>

          {/* AI Features (Future) */}
          <MotionInView>
            <Section icon={Lock} title="AI Features (Future Plans)">
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>If AI-based features are added in the future:</p>
                <ul className="space-y-2 pl-1">
                  {[
                    "Only text you select will be used for processing",
                    "Explicit consent will be requested before AI processing",
                    "API keys will be managed by you",
                    "AI provider's privacy policy will apply separately",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--free))] shrink-0
                                       shadow-[0_0_6px_hsl(var(--free-glow))]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Section>
          </MotionInView>

          {/* Changes */}
          <MotionInView>
            <section className="pt-6 border-t border-border/50">
              <h2 className="mb-3 text-lg font-serif font-medium">Policy Changes</h2>
              <p className="text-sm text-muted-foreground">
                This privacy policy may be updated. We will notify you of significant changes
                through our website. Last updated: December 2024
              </p>
            </section>
          </MotionInView>

          {/* Contact */}
          <MotionInView>
            <section className="pt-6 border-t border-border/50">
              <h2 className="mb-3 text-lg font-serif font-medium">Contact</h2>
              <p className="text-sm text-muted-foreground">
                For privacy-related inquiries, please contact us at{" "}
                <a
                  href="mailto:jonghyun.captureall@gmail.com"
                  className="text-[hsl(var(--free))] hover:underline font-mono text-xs"
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
