"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Shield, Cpu, UserX, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"

const trustIcons = {
  Shield,
  Cpu,
  UserX,
  WifiOff,
}

interface HeroProps {
  title: string
  titleHighlight?: string
  subtitle: string
  ctaText: string
  ctaHref: string
  secondaryCtaText?: string
  secondaryCtaHref?: string
  showTrustBadges?: boolean
}

export function Hero({
  title,
  titleHighlight,
  subtitle,
  ctaText,
  ctaHref,
  secondaryCtaText,
  secondaryCtaHref,
  showTrustBadges = true,
}: HeroProps) {
  const trustBadges = [
    { icon: "Shield", label: "업로드 없음", sublabel: "Zero Upload" },
    { icon: "Cpu", label: "로컬 처리", sublabel: "Local Processing" },
    { icon: "UserX", label: "계정 불필요", sublabel: "No Account" },
    { icon: "WifiOff", label: "오프라인 지원", sublabel: "Works Offline" },
  ]

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/30 py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            {title}
            {titleHighlight && (
              <>
                <br />
                <span className="text-primary">{titleHighlight}</span>
              </>
            )}
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
          >
            {subtitle}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button asChild size="lg" className="min-w-[160px]">
              <Link href={ctaHref}>{ctaText}</Link>
            </Button>
            {secondaryCtaText && secondaryCtaHref && (
              <Button asChild variant="outline" size="lg" className="min-w-[160px]">
                <Link href={secondaryCtaHref}>{secondaryCtaText}</Link>
              </Button>
            )}
          </motion.div>
        </motion.div>

        {showTrustBadges && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
            className="mt-16"
          >
            <p className="mb-6 text-center text-sm font-medium text-muted-foreground">
              프라이버시를 최우선으로
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {trustBadges.map((badge, index) => {
                const IconComponent = trustIcons[badge.icon as keyof typeof trustIcons]
                return (
                  <motion.div
                    key={badge.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 + index * 0.1, ease: "easeOut" }}
                    className="flex flex-col items-center rounded-lg border bg-card p-4 text-center"
                  >
                    <IconComponent className="h-8 w-8 text-primary" />
                    <span className="mt-2 text-sm font-medium">{badge.label}</span>
                    <span className="text-xs text-muted-foreground">{badge.sublabel}</span>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}

export function PageHero({
  title,
  subtitle,
  ctaText = "지금 사용하기",
  ctaHref = "/editor",
}: {
  title: string
  subtitle: string
  ctaText?: string
  ctaHref?: string
}) {
  return (
    <section className="bg-gradient-to-b from-background to-muted/30 py-12 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            {subtitle}
          </p>
          <div className="mt-8">
            <Button asChild size="lg">
              <Link href={ctaHref}>{ctaText}</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
