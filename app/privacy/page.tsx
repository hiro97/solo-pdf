import type { Metadata } from "next"
import { Shield, Server, Database, Eye, Lock, CheckCircle } from "lucide-react"
import { PageHero } from "@/components/marketing/Hero"
import { MotionInView } from "@/components/marketing/MotionInView"
import { Breadcrumbs } from "@/components/seo/Breadcrumbs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { siteConfig } from "@/lib/site"

export const metadata: Metadata = {
  title: "개인정보처리방침 | Privacy Policy",
  description:
    "SOLO PDF의 개인정보처리방침입니다. Zero Upload 정책으로 파일이 서버로 전송되지 않습니다.",
  keywords: ["개인정보", "프라이버시", "privacy policy", "데이터 보호"],
  openGraph: {
    title: "개인정보처리방침 - SOLO PDF",
    description: "Zero Upload. 파일이 서버로 전송되지 않습니다.",
    url: `${siteConfig.url}/privacy`,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "개인정보처리방침",
    description: "SOLO PDF 프라이버시 정책",
  },
  alternates: {
    canonical: `${siteConfig.url}/privacy`,
  },
}

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        title="개인정보처리방침"
        subtitle="Privacy Policy - 프라이버시를 최우선으로"
        ctaText="PDF 편집하기"
      />

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[{ label: "개인정보처리방침", href: "/privacy" }]}
          className="mb-8"
        />

        {/* Zero Upload Commitment */}
        <MotionInView>
          <Card className="mb-12 border-primary/50 bg-primary/5">
            <CardHeader className="flex flex-row items-center gap-4">
              <Shield className="h-10 w-10 text-primary" />
              <div>
                <CardTitle className="text-2xl">Zero Server Upload 약속</CardTitle>
                <p className="text-muted-foreground">Our Core Privacy Commitment</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg font-medium">
                SOLO PDF는 귀하의 파일을 어떤 서버로도 전송하지 않습니다.
              </p>
              <ul className="space-y-2">
                {[
                  "모든 PDF 처리는 브라우저 내에서 JavaScript/WebAssembly로 수행됩니다",
                  "파일 데이터가 인터넷을 통해 전송되는 일이 없습니다",
                  "브라우저를 닫으면 모든 임시 데이터가 삭제됩니다",
                  "네트워크 탭을 확인하여 직접 검증할 수 있습니다",
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
                <h2 className="text-2xl font-bold">수집하지 않는 정보</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>다음 정보는 수집하지 않습니다:</p>
                <ul className="list-inside list-disc space-y-1 pl-4">
                  <li>귀하의 PDF 파일 내용</li>
                  <li>파일 이름이나 메타데이터</li>
                  <li>편집 내용이나 서명 이미지</li>
                  <li>개인 식별 정보 (회원가입 없음)</li>
                </ul>
              </div>
            </section>
          </MotionInView>

          {/* What We Store Locally */}
          <MotionInView>
            <section>
              <div className="mb-6 flex items-center gap-3">
                <Database className="h-6 w-6 text-muted-foreground" />
                <h2 className="text-2xl font-bold">로컬에 저장되는 정보</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  편의를 위해 브라우저의 로컬 스토리지에 다음 정보가 저장될 수 있습니다:
                </p>
                <ul className="list-inside list-disc space-y-1 pl-4">
                  <li>테마 설정 (라이트/다크 모드)</li>
                  <li>언어 설정</li>
                  <li>최근 사용한 도구 설정 (선택적)</li>
                </ul>
                <p className="mt-4">
                  이 정보는 귀하의 기기에만 저장되며 서버로 전송되지 않습니다. 브라우저 설정에서
                  언제든지 삭제할 수 있습니다.
                </p>
              </div>
            </section>
          </MotionInView>

          {/* Analytics */}
          <MotionInView>
            <section>
              <div className="mb-6 flex items-center gap-3">
                <Eye className="h-6 w-6 text-muted-foreground" />
                <h2 className="text-2xl font-bold">분석 및 쿠키</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>서비스 개선을 위해 다음과 같은 익명 분석 데이터를 수집할 수 있습니다:</p>
                <ul className="list-inside list-disc space-y-1 pl-4">
                  <li>페이지 방문 수</li>
                  <li>사용된 기능</li>
                  <li>브라우저 종류 및 기기 유형</li>
                  <li>대략적인 지역 (국가 수준)</li>
                </ul>
                <p className="mt-4">
                  이 데이터는 개인을 식별할 수 없으며, 파일 내용과는 무관합니다.
                </p>
              </div>
            </section>
          </MotionInView>

          {/* AI Features (Future) */}
          <MotionInView>
            <section>
              <div className="mb-6 flex items-center gap-3">
                <Lock className="h-6 w-6 text-muted-foreground" />
                <h2 className="text-2xl font-bold">AI 기능 (향후 계획)</h2>
              </div>
              <div className="space-y-3 text-muted-foreground">
                <p>향후 AI 기반 기능이 추가될 경우:</p>
                <ul className="list-inside list-disc space-y-1 pl-4">
                  <li>사용자가 선택한 텍스트만 처리에 사용됩니다</li>
                  <li>AI 처리 전 명시적인 동의를 요청합니다</li>
                  <li>API 키는 사용자가 직접 관리합니다</li>
                  <li>AI 제공자의 개인정보처리방침이 별도 적용됩니다</li>
                </ul>
              </div>
            </section>
          </MotionInView>

          {/* Changes */}
          <MotionInView>
            <section>
              <h2 className="mb-4 text-2xl font-bold">정책 변경</h2>
              <p className="text-muted-foreground">
                이 개인정보처리방침은 변경될 수 있습니다. 중요한 변경 사항이 있을 경우 웹사이트를
                통해 공지합니다. 최종 업데이트: 2024년 12월
              </p>
            </section>
          </MotionInView>

          {/* Contact */}
          <MotionInView>
            <section>
              <h2 className="mb-4 text-2xl font-bold">문의</h2>
              <p className="text-muted-foreground">
                개인정보 관련 문의는{" "}
                <a
                  href="mailto:privacy@solopdf.example"
                  className="text-primary hover:underline"
                >
                  privacy@solopdf.example
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
