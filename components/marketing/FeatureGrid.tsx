"use client"

import {
  FileEdit,
  Merge,
  Split,
  FileDown,
  Type,
  EyeOff,
  PenTool,
  Lock,
  Zap,
  Globe,
  Image,
  Highlighter,
  MousePointer,
  Scissors,
  FileOutput,
  FileText,
  Upload,
  Copy,
  Layers,
  Shield,
  AlertTriangle,
  CheckCircle,
  type LucideIcon,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StaggerContainer, StaggerItem } from "./MotionInView"

// Icon lookup for string-based icon names
const iconMap: Record<string, LucideIcon> = {
  FileEdit,
  Merge,
  Split,
  FileDown,
  Type,
  EyeOff,
  PenTool,
  Lock,
  Zap,
  Globe,
  Image,
  Highlighter,
  MousePointer,
  Scissors,
  FileOutput,
  FileText,
  Upload,
  Copy,
  Layers,
  Shield,
  AlertTriangle,
  CheckCircle,
}

const features = [
  {
    iconName: "FileEdit",
    title: "PDF 편집",
    titleEn: "Edit PDF",
    description: "텍스트 추가, 이미지 삽입, 주석 달기",
  },
  {
    iconName: "Merge",
    title: "PDF 합치기",
    titleEn: "Merge PDF",
    description: "여러 PDF를 하나로 통합",
  },
  {
    iconName: "Split",
    title: "PDF 나누기",
    titleEn: "Split PDF",
    description: "PDF를 여러 파일로 분리",
  },
  {
    iconName: "FileDown",
    title: "PDF 압축",
    titleEn: "Compress PDF",
    description: "파일 크기 최적화",
  },
  {
    iconName: "Type",
    title: "텍스트 추가",
    titleEn: "Add Text",
    description: "원하는 위치에 텍스트 삽입",
  },
  {
    iconName: "EyeOff",
    title: "PDF 검열",
    titleEn: "Redact PDF",
    description: "민감한 정보 가리기",
  },
  {
    iconName: "PenTool",
    title: "PDF 서명",
    titleEn: "Sign PDF",
    description: "전자 서명 추가",
  },
  {
    iconName: "Lock",
    title: "완전 로컬",
    titleEn: "100% Local",
    description: "파일이 서버로 전송되지 않음",
  },
]

export function FeatureGrid() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            모든 PDF 작업을 한 곳에서
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            All PDF Tools in One Place
          </p>
        </div>
        <StaggerContainer className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" staggerDelay={0.08}>
          {features.map((feature) => {
            const IconComponent = iconMap[feature.iconName] || FileEdit
            return (
              <StaggerItem key={feature.title}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader>
                    <IconComponent className="h-10 w-10 text-primary" />
                    <CardTitle className="mt-4">
                      {feature.title}
                      <span className="block text-sm font-normal text-muted-foreground">
                        {feature.titleEn}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </StaggerItem>
            )
          })}
        </StaggerContainer>
      </div>
    </section>
  )
}

export function FeatureList({
  features: customFeatures,
}: {
  features: {
    iconName: string
    title: string
    description: string
  }[]
}) {
  return (
    <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" staggerDelay={0.08}>
      {customFeatures.map((feature) => {
        const IconComponent = iconMap[feature.iconName] || FileEdit
        return (
          <StaggerItem key={feature.title}>
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center gap-4">
                <IconComponent className="h-8 w-8 text-primary" />
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          </StaggerItem>
        )
      })}
    </StaggerContainer>
  )
}

export function ComparisonTable() {
  const comparisons = [
    {
      feature: "파일 업로드",
      local: "필요 없음",
      cloud: "필수",
      localBetter: true,
    },
    {
      feature: "처리 속도",
      local: "즉시 (로컬)",
      cloud: "서버 대기",
      localBetter: true,
    },
    {
      feature: "프라이버시",
      local: "완전 보장",
      cloud: "서버 의존",
      localBetter: true,
    },
    {
      feature: "오프라인 사용",
      local: "가능",
      cloud: "불가능",
      localBetter: true,
    },
    {
      feature: "대용량 파일",
      local: "브라우저 제한",
      cloud: "서버 처리",
      localBetter: false,
    },
    {
      feature: "고급 OCR",
      local: "제한적",
      cloud: "강력함",
      localBetter: false,
    },
  ]

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="py-4 text-left font-semibold">기능</th>
            <th className="py-4 text-center font-semibold text-primary">로컬 (SOLO PDF)</th>
            <th className="py-4 text-center font-semibold text-muted-foreground">클라우드 서비스</th>
          </tr>
        </thead>
        <tbody>
          {comparisons.map((row) => (
            <tr key={row.feature} className="border-b">
              <td className="py-3">{row.feature}</td>
              <td className={`py-3 text-center ${row.localBetter ? "font-medium text-primary" : ""}`}>
                {row.local}
              </td>
              <td className={`py-3 text-center ${!row.localBetter ? "font-medium" : "text-muted-foreground"}`}>
                {row.cloud}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
