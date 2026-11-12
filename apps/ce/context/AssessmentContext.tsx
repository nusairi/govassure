'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import type { Answer } from '@/data/questions'
import type { AssessmentState } from '@/lib/types'
import {
  defaultState,
  loadState,
  saveState,
  clearState,
  setAnswer,
  markSectionComplete,
} from '@/lib/assessmentStore'

interface AssessmentContextValue {
  state: AssessmentState
  setAnswer: (sectionSlug: string, questionId: string, answer: Answer) => void
  markSectionComplete: (sectionSlug: string) => void
  resetAssessment: () => void
  isLoaded: boolean
}

const AssessmentContext = createContext<AssessmentContextValue | null>(null)

export function AssessmentProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AssessmentState>(defaultState)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const loaded = loadState()
    setState(
      loaded.startedAt
        ? loaded
        : { ...defaultState, startedAt: new Date().toISOString() }
    )
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) saveState(state)
  }, [state, isLoaded])

  const handleSetAnswer = (sectionSlug: string, questionId: string, answer: Answer) => {
    setState((prev) => setAnswer(prev, sectionSlug, questionId, answer))
  }

  const handleMarkSectionComplete = (sectionSlug: string) => {
    setState((prev) => markSectionComplete(prev, sectionSlug))
  }

  const handleReset = () => {
    clearState()
    setState({ ...defaultState, startedAt: new Date().toISOString() })
  }

  return (
    <AssessmentContext.Provider
      value={{
        state,
        setAnswer: handleSetAnswer,
        markSectionComplete: handleMarkSectionComplete,
        resetAssessment: handleReset,
        isLoaded,
      }}
    >
      {children}
    </AssessmentContext.Provider>
  )
}

export function useAssessment(): AssessmentContextValue {
  const ctx = useContext(AssessmentContext)
  if (!ctx) throw new Error('useAssessment must be used within AssessmentProvider')
  return ctx
}
