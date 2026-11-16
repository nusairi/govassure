'use client'

import Link from 'next/link'
import { sections } from '@/data/questions'
import { useAssessment } from '@/context/AssessmentContext'
import { isSectionComplete, computeResults } from '@/lib/assessmentStore'

const statusConfig = {
  pass: { label: 'Pass', className: 'ce-tag--pass' },
  fail: { label: 'Fail', className: 'ce-tag--fail' },
  incomplete: { label: 'Not started', className: 'ce-tag--incomplete' },
}

export default function AssessmentOverviewPage() {
  const { state, resetAssessment } = useAssessment()
  const results = computeResults(state)

  const answeredCount = results.answeredQuestions
  const totalCount = results.totalQuestions
  const progressPct = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0

  return (
    <>
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item">
            <Link className="govuk-breadcrumbs__link" href="/">Home</Link>
          </li>
          <li className="govuk-breadcrumbs__list-item">Assessment</li>
        </ol>
      </nav>

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">Your assessment</h1>

          {answeredCount > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <p className="govuk-body govuk-!-margin-bottom-1">
                <strong>{answeredCount} of {totalCount}</strong> questions answered ({progressPct}%)
              </p>
              <div className="ce-progress-bar">
                <div className="ce-progress-bar__fill" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
          )}

          <p className="govuk-body">
            Work through each of the five Cyber Essentials control areas. You can complete them in
            any order and come back to change your answers at any time.
          </p>

          {results.overallStatus !== 'incomplete' && (
            <div
              className={`govuk-panel ${results.overallStatus === 'pass' ? 'govuk-panel--confirmation' : ''}`}
              style={{
                background: results.overallStatus === 'pass' ? '#00703c' : '#d4351c',
                marginBottom: '2rem',
              }}
            >
              <h2 className="govuk-panel__title">
                {results.overallStatus === 'pass'
                  ? 'Assessment complete — likely ready'
                  : 'Assessment complete — remediation needed'}
              </h2>
              <div className="govuk-panel__body">
                <Link href="/results" className="govuk-link" style={{ color: 'white' }}>
                  View full results and remediation guidance →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <ol className="govuk-list" style={{ counterReset: 'none' }}>
            {sections.map((section, i) => {
              const sectionResult = results.sections.find((r) => r.sectionSlug === section.slug)
              const complete = isSectionComplete(state, section.slug)
              const status = sectionResult?.status ?? 'incomplete'
              const cfg = statusConfig[status]

              return (
                <li key={section.id} style={{ marginBottom: '1rem' }}>
                  <div className={`ce-section-card ce-section-card--${status}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ flex: 1 }}>
                        <h2 className="govuk-heading-m" style={{ marginBottom: '0.25rem' }}>
                          <span style={{ color: '#505a5f', fontWeight: 400, marginRight: '0.5rem' }}>
                            {i + 1}.
                          </span>
                          {section.title}
                        </h2>
                        <p className="govuk-body-s" style={{ marginBottom: '0.5rem', color: '#505a5f' }}>
                          {section.questions.length} questions
                          {complete && sectionResult && (
                            <> &middot; {sectionResult.passedQuestions} passed
                            {sectionResult.failedQuestions + sectionResult.partialQuestions > 0 && (
                              <>, {sectionResult.failedQuestions + sectionResult.partialQuestions} failed</>
                            )}</>
                          )}
                        </p>
                        <p className="govuk-body-s" style={{ margin: 0, color: '#505a5f' }}>
                          {section.description.split('.')[0]}.
                        </p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                        <strong
                          className={`govuk-tag ${cfg.className}`}
                          style={{ whiteSpace: 'nowrap' }}
                        >
                          {cfg.label}
                        </strong>
                        <Link
                          href={`/assessment/${section.slug}`}
                          className="govuk-button govuk-button--secondary"
                          style={{ marginBottom: 0 }}
                        >
                          {complete ? 'Review answers' : 'Start'}
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>

          {answeredCount > 0 && (
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/results" className="govuk-button">
                View results
              </Link>
              <button
                className="govuk-button govuk-button--warning"
                onClick={() => {
                  if (window.confirm('This will clear all your answers. Are you sure?')) {
                    resetAssessment()
                  }
                }}
              >
                Reset assessment
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
