import type { Metadata } from "next"
import { FileText, AlertTriangle, Scale, Shield } from "lucide-react"
import { PageHero } from "@/components/marketing/Hero"
import { MotionInView } from "@/components/marketing/MotionInView"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"
import { siteConfig } from "@/lib/site"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for SOLO PDF. Please read before using our service.",
  keywords: ["terms of service", "terms and conditions", "legal terms"],
  openGraph: {
    title: "Terms of Service - SOLO PDF",
    description: "Terms of Service for SOLO PDF",
    url: `${siteConfig.url}/terms`,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Terms of Service",
    description: "SOLO PDF Terms of Service",
  },
  alternates: {
    canonical: `${siteConfig.url}/terms`,
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

export default function TermsPage() {
  return (
    <>
      <PageHero
        title="Terms of Service"
        subtitle="Please read these terms carefully before using our service"
        ctaText="Edit PDF"
      />

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Terms of Service", href: "/terms" }]} className="mb-8" />

        {/* Disclaimer - Keep amber for warning */}
        <MotionInView>
          <div className="mb-10 rounded-2xl p-6 md:p-8
                          border border-amber-500/30
                          bg-gradient-to-br from-amber-500/5 via-amber-500/8 to-amber-500/2">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/30
                              flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <h2 className="text-lg font-serif font-medium">Legal Notice</h2>
                <p className="text-xs font-mono uppercase tracking-wider text-amber-600 mt-1">
                  Important Disclaimer
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              This document is not legal advice. It provides general guidance on using our service.
              For legally binding contracts or documents, please consult a professional legal service.
            </p>
          </div>
        </MotionInView>

        <div className="space-y-10">
          {/* Service Description */}
          <MotionInView>
            <Section icon={FileText} title="Service Description">
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>SOLO PDF is a browser-based PDF editing tool:</p>
                <ul className="space-y-2 pl-1">
                  {[
                    "Provides PDF editing, merging, splitting, compression, signing, and redaction features",
                    "All processing is performed locally in your browser",
                    "Files are never uploaded to any server",
                    "Free to use without registration",
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

          {/* Terms of Use */}
          <MotionInView>
            <Section icon={Scale} title="Terms of Use">
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>By using this service, you agree to the following:</p>
                <ul className="space-y-2 pl-1">
                  {[
                    "Use the service only for lawful purposes",
                    "Do not use for processing documents that infringe on others' rights",
                    "Do not abuse or interfere with the service",
                    "Do not engage in automated bulk usage",
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

          {/* Disclaimer */}
          <MotionInView>
            <Section icon={AlertTriangle} title="Disclaimer">
              <div className="space-y-4 text-sm text-muted-foreground">
                <div>
                  <p className="font-medium text-foreground mb-2">The service is provided "AS IS":</p>
                  <ul className="space-y-2 pl-1">
                    {[
                      "No warranty of fitness for a particular purpose",
                      "No liability for data loss",
                      "No liability for service interruptions or errors",
                      "No guarantee of legal validity of edited documents",
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--free))] shrink-0
                                         shadow-[0_0_6px_hsl(var(--free-glow))]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-border/50">
                  <p className="font-medium text-foreground mb-2">User Responsibilities:</p>
                  <ul className="space-y-2 pl-1">
                    {[
                      "Always back up important files",
                      "Have legal documents reviewed by professionals",
                      "Security of sensitive information is your responsibility",
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--free))] shrink-0
                                         shadow-[0_0_6px_hsl(var(--free-glow))]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Section>
          </MotionInView>

          {/* Intellectual Property */}
          <MotionInView>
            <Section icon={Shield} title="Intellectual Property">
              <div className="space-y-3 text-sm text-muted-foreground">
                <ul className="space-y-2 pl-1">
                  {[
                    "SOLO PDF trademarks, logos, and designs are protected",
                    "Copyright of documents you process belongs to you",
                    "Some service code is subject to open source licenses",
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
              <h2 className="mb-3 text-lg font-serif font-medium">Changes to Terms</h2>
              <p className="text-sm text-muted-foreground">
                These terms may be changed without prior notice. Continued use constitutes acceptance
                of the modified terms. Last updated: December 2024
              </p>
            </section>
          </MotionInView>

          {/* Governing Law */}
          <MotionInView>
            <section className="pt-6 border-t border-border/50">
              <h2 className="mb-3 text-lg font-serif font-medium">Governing Law</h2>
              <p className="text-sm text-muted-foreground">
                These terms shall be governed by and construed in accordance with applicable laws.
              </p>
            </section>
          </MotionInView>

          {/* Contact */}
          <MotionInView>
            <section className="pt-6 border-t border-border/50">
              <h2 className="mb-3 text-lg font-serif font-medium">Contact</h2>
              <p className="text-sm text-muted-foreground">
                For questions about these terms, please contact us at{" "}
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
