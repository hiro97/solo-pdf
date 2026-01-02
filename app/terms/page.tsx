import type { Metadata } from "next"
import { FileText, AlertTriangle, Scale, Shield } from "lucide-react"
import { PageHero } from "@/components/marketing/Hero"
import { MotionInView } from "@/components/marketing/MotionInView"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

export default function TermsPage() {
  return (
    <>
      <PageHero
        title="Terms of Service"
        subtitle="Please read these terms carefully before using our service"
        ctaText="Edit PDF"
      />

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Terms of Service", href: "/terms" }]} className="mb-8" />

        {/* Disclaimer */}
        <MotionInView>
          <Card className="mb-12 border-amber-500/50 bg-amber-500/5">
            <CardHeader className="flex flex-row items-center gap-4">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
              <CardTitle>Legal Notice</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This document is not legal advice. It provides general guidance on using our service.
                For legally binding contracts or documents, please consult a professional legal service.
              </p>
            </CardContent>
          </Card>
        </MotionInView>

        <div className="space-y-12">
          {/* Service Description */}
          <MotionInView>
            <section>
              <div className="mb-6 flex items-center gap-3">
                <FileText className="h-6 w-6 text-muted-foreground" />
                <h2 className="text-2xl font-bold">Service Description</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>SOLO PDF is a browser-based PDF editing tool:</p>
                <ul className="list-inside list-disc space-y-1 pl-4">
                  <li>Provides PDF editing, merging, splitting, compression, signing, and redaction features</li>
                  <li>All processing is performed locally in your browser</li>
                  <li>Files are never uploaded to any server</li>
                  <li>Free to use without registration</li>
                </ul>
              </div>
            </section>
          </MotionInView>

          {/* Terms of Use */}
          <MotionInView>
            <section>
              <div className="mb-6 flex items-center gap-3">
                <Scale className="h-6 w-6 text-muted-foreground" />
                <h2 className="text-2xl font-bold">Terms of Use</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>By using this service, you agree to the following:</p>
                <ul className="list-inside list-disc space-y-1 pl-4">
                  <li>Use the service only for lawful purposes</li>
                  <li>Do not use for processing documents that infringe on others' rights</li>
                  <li>Do not abuse or interfere with the service</li>
                  <li>Do not engage in automated bulk usage</li>
                </ul>
              </div>
            </section>
          </MotionInView>

          {/* Disclaimer */}
          <MotionInView>
            <section>
              <div className="mb-6 flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-muted-foreground" />
                <h2 className="text-2xl font-bold">Disclaimer</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p className="font-medium">The service is provided "AS IS":</p>
                <ul className="list-inside list-disc space-y-1 pl-4">
                  <li>No warranty of fitness for a particular purpose</li>
                  <li>No liability for data loss</li>
                  <li>No liability for service interruptions or errors</li>
                  <li>No guarantee of legal validity of edited documents</li>
                </ul>
                <p className="mt-4 font-medium">User Responsibilities:</p>
                <ul className="list-inside list-disc space-y-1 pl-4">
                  <li>Always back up important files</li>
                  <li>Have legal documents reviewed by professionals</li>
                  <li>Security of sensitive information is your responsibility</li>
                </ul>
              </div>
            </section>
          </MotionInView>

          {/* Intellectual Property */}
          <MotionInView>
            <section>
              <div className="mb-6 flex items-center gap-3">
                <Shield className="h-6 w-6 text-muted-foreground" />
                <h2 className="text-2xl font-bold">Intellectual Property</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <ul className="list-inside list-disc space-y-1 pl-4">
                  <li>SOLO PDF trademarks, logos, and designs are protected</li>
                  <li>Copyright of documents you process belongs to you</li>
                  <li>Some service code is subject to open source licenses</li>
                </ul>
              </div>
            </section>
          </MotionInView>

          {/* Changes */}
          <MotionInView>
            <section>
              <h2 className="mb-4 text-2xl font-bold">Changes to Terms</h2>
              <p className="text-muted-foreground">
                These terms may be changed without prior notice. Continued use constitutes acceptance
                of the modified terms. Last updated: December 2024
              </p>
            </section>
          </MotionInView>

          {/* Governing Law */}
          <MotionInView>
            <section>
              <h2 className="mb-4 text-2xl font-bold">Governing Law</h2>
              <p className="text-muted-foreground">
                These terms shall be governed by and construed in accordance with applicable laws.
              </p>
            </section>
          </MotionInView>

          {/* Contact */}
          <MotionInView>
            <section>
              <h2 className="mb-4 text-2xl font-bold">Contact</h2>
              <p className="text-muted-foreground">
                For questions about these terms, please contact us at{" "}
                <a href="mailto:jonghyun.captureall@gmail.com" className="text-primary hover:underline">
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
