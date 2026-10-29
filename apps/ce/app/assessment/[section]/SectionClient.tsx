'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSectionBySlug, sections } from '@/data/questions'
import type { Answer } from '@/data/questions'
import { useAssessment } from '@/context/AssessmentContext'
import { isSectionComplete } from '@/lib/assessmentStore'

export default function SectionPage() {
  const params = useParams()
  const router = useRouter()
  const sectionSlug = params.section as string
  const section = getSectionBySlug(sectionSlug)

  const { state, setAnswer, markSectionComplete, isLoaded } = useAssessment()
  const [showGuidance, setShowGuidance] = useState<Record<string, boolean>>({})
  const [validationError, setValidationError] = useState<string | null>(null)

  if (!section) {
    return (
      <div>
        <h1 className="govuk-heading-xl">Section not found</h1>
        <Link href="/assessment" className="govuk-link">Back to assessment</Link>
      </div>
    )
  }

  const sectionIndex = sections.findIndex((s) => s.slug === sectionSlug)
  const nextSection = sections[sectionIndex + 1]
  const sectionAnswers = state.answers[sectionSlug] ?? {}

  const answeredCount = section.questions.filter((q) => sectionAnswers[q.id] != null).length
  const progressPct = Math.round((answeredCount / section.questions.length) * 100)

  const handleAnswer = (questionId: string, answer: Answer) => {
    setAnswer(sectionSlug, questionId, answer)
    setValidationError(null)
  }

  const toggleGuidance = (questionId: string) => {
    setShowGuidance((prev) => ({ ...prev, [questionId]: !prev[questionId] }))
  }

  const handleSubmit = () => {
    const allAnswered = section.questions.every((q) => sectionAnswers[q.id] != null)
    if (!allAnswered) {
      setValidationError('Answer all questions before continuing.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    markSectionComplete(sectionSlug)
    if (nextSection) {
      router.push(`/assessment/${nextSection.slug}`)
    } else {
      router.push('/results')
    }
  }

  const answerOptions: { value: Answer; label: string; hint?: string }[] = [
    { value: 'yes', label: 'Yes', hint: 'This is fully in place' },
    { value: 'partial', label: 'Partial', hint: 'In place for some systems or users' },
    { value: 'no', label: 'No', hint: 'Not currently in place' },
  ]

  if (!isLoaded) return null

  return (
    <>
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item">
            <Link className="govuk-breadcrumbs__link" href="/">Home</Link>
          </li>
          <li className="govuk-breadcrumbs__list-item">
            <Link className="govuk-breadcrumbs__link" href="/assessment">Assessment</Link>
          </li>
          <li className="govuk-breadcrumbs__list-item">{section.title}</li>
        </ol>
      </nav>

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">

          <span className="govuk-caption-xl">
            Section {sectionIndex + 1} of {sections.length}
          </span>
          <h1 className="govuk-heading-xl">{section.title}</h1>

          <p className="govuk-body">{section.description}</p>

          <p className="govuk-body-s" style={{ color: '#505a5f' }}>
            Source: {section.ncscReference}
          </p>

          <div style={{ marginBottom: '1.5rem' }}>
            <p className="govuk-body govuk-!-margin-bottom-1">
              <strong>{answeredCount} of {section.questions.length}</strong> questions answered
            </p>
            <div className="ce-progress-bar">
              <div className="ce-progress-bar__fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          {validationError && (
            <div className="govuk-error-summary" data-module="govuk-error-summary">
              <div role="alert">
                <h2 className="govuk-error-summary__title">There is a problem</h2>
                <div className="govuk-error-summary__body">
                  <ul className="govuk-list govuk-error-summary__list">
                    <li>{validationError}</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit()
            }}
          >
            {section.questions.map((question, qi) => {
              const currentAnswer = sectionAnswers[question.id]
              const showRem = currentAnswer === 'no' || currentAnswer === 'partial'

              return (
                <div
                  key={question.id}
                  className="govuk-form-group"
                  style={{
                    borderLeft: currentAnswer
                      ? currentAnswer === 'yes'
                        ? '4px solid #00703c'
                        : '4px solid #d4351c'
                      : '4px solid #b1b4b6',
                    paddingLeft: '1rem',
                    marginBottom: '2rem',
                    paddingBottom: '0.5rem',
                  }}
                >
                  <fieldset className="govuk-fieldset">
                    <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                      <h2 className="govuk-fieldset__heading">
                        <span style={{ color: '#505a5f', fontWeight: 400 }}>
                          {qi + 1}.{' '}
                        </span>
                        {question.text}
                        {question.weight === 'critical' && (
                          <span className="ce-critical-badge">Critical</span>
                        )}
                      </h2>
                    </legend>

                    <button
                      type="button"
                      className="govuk-link"
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        marginBottom: '0.75rem',
                        display: 'block',
                      }}
                      onClick={() => toggleGuidance(question.id)}
                    >
                      {showGuidance[question.id] ? '▲ Hide guidance' : '▼ What does this mean?'}
                    </button>

                    {showGuidance[question.id] && (
                      <div className="govuk-inset-text" style={{ marginBottom: '0.75rem' }}>
                        <p className="govuk-body-s" style={{ margin: 0 }}>
                          {question.guidance}
                        </p>
                      </div>
                    )}

                    <div className="govuk-radios govuk-radios--inline">
                      {answerOptions.map((opt) => (
                        <div className="govuk-radios__item" key={opt.value}>
                          <input
                            className="govuk-radios__input"
                            id={`${question.id}-${opt.value}`}
                            name={question.id}
                            type="radio"
                            value={opt.value ?? ''}
                            checked={currentAnswer === opt.value}
                            onChange={() => handleAnswer(question.id, opt.value)}
                          />
                          <label
                            className="govuk-label govuk-radios__label"
                            htmlFor={`${question.id}-${opt.value}`}
                          >
                            {opt.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </fieldset>

                  {showRem && (
                    <div className="ce-remediation">
                      <strong>Remediation guidance:</strong> {question.remediationGuidance}
                    </div>
                  )}
                </div>
              )
            })}

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem' }}>
              <button type="submit" className="govuk-button">
                {nextSection ? `Continue to ${nextSection.title}` : 'View results'}
              </button>
              <Link href="/assessment" className="govuk-button govuk-button--secondary">
                Save and return to overview
              </Link>
            </div>
          </form>
        </div>

        <div className="govuk-grid-column-one-third">
          <div style={{ position: 'sticky', top: '1rem' }}>
            <h2 className="govuk-heading-s">Sections</h2>
            <ul className="govuk-list">
              {sections.map((s, i) => {
                const isComplete = isSectionComplete(state, s.slug)
                const isCurrent = s.slug === sectionSlug
                return (
                  <li key={s.id} style={{ marginBottom: '0.25rem' }}>
                    <Link
                      href={`/assessment/${s.slug}`}
                      className="govuk-link"
                      style={{
                        fontWeight: isCurrent ? 700 : 400,
                        textDecoration: isCurrent ? 'none' : undefined,
                        color: isCurrent ? '#0b0c0c' : undefined,
                      }}
                    >
                      {i + 1}. {s.title}
                      {isComplete && (
                        <span style={{ color: '#00703c', marginLeft: '0.25rem' }}>✓</span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}
