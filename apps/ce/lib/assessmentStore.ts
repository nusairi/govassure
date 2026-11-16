import { sections } from '@/data/questions'
import type { Answer } from '@/data/questions'
import type { AssessmentState, SectionResult, OverallResult } from './types'

const STORAGE_KEY = 'ce-readiness-assessment'

export const defaultState: AssessmentState = {
  answers: {},
  completedSections: [],
  startedAt: null,
}

export function loadState(): AssessmentState {
  if (typeof window === 'undefined') return defaultState
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState
    return JSON.parse(raw) as AssessmentState
  } catch {
    return defaultState
  }
}

export function saveState(state: AssessmentState): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function clearState(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

export function setAnswer(
  state: AssessmentState,
  sectionSlug: string,
  questionId: string,
  answer: Answer
): AssessmentState {
  return {
    ...state,
    answers: {
      ...state.answers,
      [sectionSlug]: {
        ...(state.answers[sectionSlug] ?? {}),
        [questionId]: answer,
      },
    },
  }
}

export function markSectionComplete(
  state: AssessmentState,
  sectionSlug: string
): AssessmentState {
  if (state.completedSections.includes(sectionSlug)) return state
  return {
    ...state,
    completedSections: [...state.completedSections, sectionSlug],
  }
}

export function isSectionComplete(
  state: AssessmentState,
  sectionSlug: string
): boolean {
  const section = sections.find((s) => s.slug === sectionSlug)
  if (!section) return false
  const sectionAnswers = state.answers[sectionSlug] ?? {}
  return section.questions.every((q) => sectionAnswers[q.id] != null)
}

export function computeResults(state: AssessmentState): OverallResult {
  const sectionResults: SectionResult[] = sections.map((section) => {
    const sectionAnswers = state.answers[section.slug] ?? {}
    let passed = 0
    let failed = 0
    let partial = 0
    let criticalFailures = 0
    const failingQuestions: SectionResult['failingQuestions'] = []

    for (const q of section.questions) {
      const answer = sectionAnswers[q.id]
      if (answer == null) continue

      const passes =
        (q.passCondition === 'yes' && answer === 'yes') ||
        (q.passCondition === 'no' && answer === 'no')

      if (passes) {
        passed++
      } else if (answer === 'partial') {
        partial++
        failingQuestions.push({
          id: q.id,
          text: q.text,
          remediationGuidance: q.remediationGuidance,
          weight: q.weight,
        })
        if (q.weight === 'critical') criticalFailures++
      } else if (answer === 'no' || answer === 'yes') {
        failed++
        failingQuestions.push({
          id: q.id,
          text: q.text,
          remediationGuidance: q.remediationGuidance,
          weight: q.weight,
        })
        if (q.weight === 'critical') criticalFailures++
      }
    }

    const answeredQuestions = passed + failed + partial
    const totalQuestions = section.questions.length
    const isComplete = answeredQuestions === totalQuestions

    let status: SectionResult['status']
    if (!isComplete) {
      status = 'incomplete'
    } else if (failed > 0 || partial > 0) {
      status = 'fail'
    } else {
      status = 'pass'
    }

    return {
      sectionSlug: section.slug,
      title: section.title,
      totalQuestions,
      answeredQuestions,
      passedQuestions: passed,
      failedQuestions: failed,
      partialQuestions: partial,
      criticalFailures,
      status,
      failingQuestions,
    }
  })

  const totalQuestions = sectionResults.reduce((a, s) => a + s.totalQuestions, 0)
  const answeredQuestions = sectionResults.reduce((a, s) => a + s.answeredQuestions, 0)
  const criticalFailures = sectionResults.reduce((a, s) => a + s.criticalFailures, 0)

  const allComplete = sectionResults.every((s) => s.status !== 'incomplete')
  const anyFail = sectionResults.some((s) => s.status === 'fail')

  const overallStatus: OverallResult['overallStatus'] = !allComplete
    ? 'incomplete'
    : anyFail
    ? 'fail'
    : 'pass'

  return {
    sections: sectionResults,
    overallStatus,
    totalQuestions,
    answeredQuestions,
    criticalFailures,
  }
}
