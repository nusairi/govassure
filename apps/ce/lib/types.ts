import type { Answer } from '@/data/questions'

export interface SectionAnswers {
  [questionId: string]: Answer
}

export interface AssessmentState {
  answers: {
    [sectionSlug: string]: SectionAnswers
  }
  completedSections: string[]
  startedAt: string | null
}

export interface SectionResult {
  sectionSlug: string
  title: string
  totalQuestions: number
  answeredQuestions: number
  passedQuestions: number
  failedQuestions: number
  partialQuestions: number
  criticalFailures: number
  status: 'pass' | 'fail' | 'incomplete'
  failingQuestions: { id: string; text: string; remediationGuidance: string; weight: 'critical' | 'standard' }[]
}

export interface OverallResult {
  sections: SectionResult[]
  overallStatus: 'pass' | 'fail' | 'incomplete'
  totalQuestions: number
  answeredQuestions: number
  criticalFailures: number
}
