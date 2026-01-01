"use client"

import { Upload, Settings, Download, CheckCircle } from "lucide-react"
import { MotionInView } from "./MotionInView"

const steps = [
  {
    icon: Upload,
    step: "1",
    title: "파일 선택",
    titleEn: "Select File",
    description: "PDF 파일을 드래그하거나 클릭해서 선택하세요. 파일은 브라우저에만 로드됩니다.",
  },
  {
    icon: Settings,
    step: "2",
    title: "편집 작업",
    titleEn: "Edit & Process",
    description: "필요한 작업을 선택하고 실행하세요. 모든 처리는 로컬에서 이루어집니다.",
  },
  {
    icon: Download,
    step: "3",
    title: "다운로드",
    titleEn: "Download",
    description: "완료된 파일을 다운로드하세요. 원본과 결과물 모두 서버에 저장되지 않습니다.",
  },
]

export function HowItWorks() {
  return (
    <section className="bg-muted/30 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <MotionInView className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            사용 방법
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            How It Works - 3단계로 간단하게
          </p>
        </MotionInView>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <MotionInView key={step.step} delay={index * 0.15}>
              <div className="relative flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  {step.step}
                </div>
                <step.icon className="mt-4 h-8 w-8 text-muted-foreground" />
                <h3 className="mt-4 text-xl font-semibold">
                  {step.title}
                  <span className="block text-sm font-normal text-muted-foreground">
                    {step.titleEn}
                  </span>
                </h3>
                <p className="mt-2 text-muted-foreground">{step.description}</p>
                {index < steps.length - 1 && (
                  <div className="absolute right-0 top-8 hidden h-0.5 w-full -translate-y-1/2 bg-border md:block md:w-1/2 md:translate-x-full" />
                )}
              </div>
            </MotionInView>
          ))}
        </div>

        <MotionInView delay={0.5} className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary">
            <CheckCircle className="h-4 w-4" />
            <span>모든 단계에서 파일은 브라우저를 떠나지 않습니다</span>
          </div>
        </MotionInView>
      </div>
    </section>
  )
}

export function StepByStep({
  steps: customSteps,
}: {
  steps: {
    step: string
    title: string
    description: string
  }[]
}) {
  return (
    <div className="space-y-6">
      {customSteps.map((step, index) => (
        <MotionInView key={step.step} delay={index * 0.1}>
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {step.step}
            </div>
            <div>
              <h3 className="font-semibold">{step.title}</h3>
              <p className="mt-1 text-muted-foreground">{step.description}</p>
            </div>
          </div>
        </MotionInView>
      ))}
    </div>
  )
}
