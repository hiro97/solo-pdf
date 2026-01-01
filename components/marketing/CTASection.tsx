"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MotionInView } from "./MotionInView"

interface CTASectionProps {
  title?: string
  subtitle?: string
  ctaText?: string
  ctaHref?: string
  variant?: "default" | "card"
}

export function CTASection({
  title = "지금 바로 시작하세요",
  subtitle = "업로드 없이, 가입 없이, 완전히 무료로",
  ctaText = "PDF 열기",
  ctaHref = "/editor",
  variant = "default",
}: CTASectionProps) {
  if (variant === "card") {
    return (
      <MotionInView>
        <div className="rounded-2xl bg-primary px-6 py-12 text-center text-primary-foreground md:px-12">
          <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
          <p className="mx-auto mt-4 max-w-xl opacity-90">{subtitle}</p>
          <div className="mt-8">
            <Button asChild size="lg" variant="secondary">
              <Link href={ctaHref}>{ctaText}</Link>
            </Button>
          </div>
        </div>
      </MotionInView>
    )
  }

  return (
    <section className="border-t bg-muted/30 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <MotionInView className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">{subtitle}</p>
          <div className="mt-8">
            <Button asChild size="lg">
              <Link href={ctaHref}>{ctaText}</Link>
            </Button>
          </div>
        </MotionInView>
      </div>
    </section>
  )
}

export function InlineCTA({
  text = "지금 무료로 시작하기",
  href = "/editor",
}: {
  text?: string
  href?: string
}) {
  return (
    <div className="my-8 text-center">
      <Button asChild size="lg">
        <Link href={href}>{text}</Link>
      </Button>
    </div>
  )
}
