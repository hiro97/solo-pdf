import type { Metadata } from "next"
import { FileText, AlertTriangle, Scale, Shield } from "lucide-react"
import { PageHero } from "@/components/marketing/Hero"
import { MotionInView } from "@/components/marketing/MotionInView"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { siteConfig } from "@/lib/site"

export const metadata: Metadata = {
  title: "이용약관 | Terms of Service",
  description: "SOLO PDF 서비스 이용약관입니다. 서비스 사용 전 반드시 읽어주세요.",
  keywords: ["이용약관", "terms of service", "서비스 약관"],
  openGraph: {
    title: "이용약관 - SOLO PDF",
    description: "SOLO PDF 서비스 이용약관",
    url: `${siteConfig.url}/terms`,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "이용약관",
    description: "SOLO PDF 이용약관",
  },
  alternates: {
    canonical: `${siteConfig.url}/terms`,
  },
}

export default function TermsPage() {
  return (
    <>
      <PageHero
        title="이용약관"
        subtitle="Terms of Service - 서비스 이용 조건"
        ctaText="PDF 편집하기"
      />

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "이용약관", href: "/terms" }]} className="mb-8" />

        {/* Disclaimer */}
        <MotionInView>
          <Card className="mb-12 border-amber-500/50 bg-amber-500/5">
            <CardHeader className="flex flex-row items-center gap-4">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
              <CardTitle>법적 고지</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                이 문서는 법률 자문이 아닙니다. 서비스 사용에 관한 일반적인 안내입니다. 법적
                효력이 있는 계약이나 문서 작업에는 전문 법률 서비스를 이용하세요.
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
                <h2 className="text-2xl font-bold">서비스 설명</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>SOLO PDF는 브라우저 기반 PDF 편집 도구입니다:</p>
                <ul className="list-inside list-disc space-y-1 pl-4">
                  <li>PDF 편집, 합치기, 나누기, 압축, 서명, 검열 기능 제공</li>
                  <li>모든 처리는 사용자의 브라우저에서 로컬로 수행</li>
                  <li>파일이 서버로 업로드되지 않음</li>
                  <li>회원가입 없이 무료로 사용 가능</li>
                </ul>
              </div>
            </section>
          </MotionInView>

          {/* Terms of Use */}
          <MotionInView>
            <section>
              <div className="mb-6 flex items-center gap-3">
                <Scale className="h-6 w-6 text-muted-foreground" />
                <h2 className="text-2xl font-bold">사용 조건</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>서비스를 사용함으로써 다음에 동의합니다:</p>
                <ul className="list-inside list-disc space-y-1 pl-4">
                  <li>합법적인 목적으로만 사용합니다</li>
                  <li>타인의 권리를 침해하는 문서 처리에 사용하지 않습니다</li>
                  <li>서비스를 악용하거나 방해하지 않습니다</li>
                  <li>자동화된 대량 사용을 하지 않습니다</li>
                </ul>
              </div>
            </section>
          </MotionInView>

          {/* Disclaimer */}
          <MotionInView>
            <section>
              <div className="mb-6 flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-muted-foreground" />
                <h2 className="text-2xl font-bold">면책 조항</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p className="font-medium">서비스는 있는 그대로(AS IS) 제공됩니다:</p>
                <ul className="list-inside list-disc space-y-1 pl-4">
                  <li>특정 목적에의 적합성을 보증하지 않습니다</li>
                  <li>데이터 손실에 대한 책임을 지지 않습니다</li>
                  <li>서비스 중단이나 오류에 대한 책임을 지지 않습니다</li>
                  <li>편집된 문서의 법적 효력을 보증하지 않습니다</li>
                </ul>
                <p className="mt-4 font-medium">사용자 책임:</p>
                <ul className="list-inside list-disc space-y-1 pl-4">
                  <li>중요한 파일은 항상 백업하세요</li>
                  <li>법적 문서는 전문가의 검토를 받으세요</li>
                  <li>민감한 정보의 보안은 사용자 책임입니다</li>
                </ul>
              </div>
            </section>
          </MotionInView>

          {/* Intellectual Property */}
          <MotionInView>
            <section>
              <div className="mb-6 flex items-center gap-3">
                <Shield className="h-6 w-6 text-muted-foreground" />
                <h2 className="text-2xl font-bold">지적 재산권</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <ul className="list-inside list-disc space-y-1 pl-4">
                  <li>SOLO PDF의 상표, 로고, 디자인은 보호됩니다</li>
                  <li>사용자가 처리하는 문서의 저작권은 사용자에게 있습니다</li>
                  <li>서비스 코드의 일부는 오픈소스 라이선스를 따릅니다</li>
                </ul>
              </div>
            </section>
          </MotionInView>

          {/* Changes */}
          <MotionInView>
            <section>
              <h2 className="mb-4 text-2xl font-bold">약관 변경</h2>
              <p className="text-muted-foreground">
                이 약관은 사전 통지 없이 변경될 수 있습니다. 계속 사용하면 변경된 약관에 동의하는
                것으로 간주됩니다. 최종 업데이트: 2024년 12월
              </p>
            </section>
          </MotionInView>

          {/* Governing Law */}
          <MotionInView>
            <section>
              <h2 className="mb-4 text-2xl font-bold">준거법</h2>
              <p className="text-muted-foreground">
                이 약관은 대한민국 법률에 따라 해석됩니다.
              </p>
            </section>
          </MotionInView>

          {/* Contact */}
          <MotionInView>
            <section>
              <h2 className="mb-4 text-2xl font-bold">문의</h2>
              <p className="text-muted-foreground">
                약관 관련 문의는{" "}
                <a href="mailto:legal@solopdf.example" className="text-primary hover:underline">
                  legal@solopdf.example
                </a>
                로 연락해 주세요.
              </p>
            </section>
          </MotionInView>
        </div>
      </div>
    </>
  )
}
