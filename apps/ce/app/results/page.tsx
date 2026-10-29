'use client'

import Link from 'next/link'
import { useAssessment } from '@/context/AssessmentContext'
import { computeResults } from '@/lib/assessmentStore'

const statusLabel = {
  pass: 'Pass',
  fail: 'Needs remediation',
  incomplete: 'Incomplete',
}

const statusTagClass = {
  pass: 'ce-tag--pass',
  fail: 'ce-tag--fail',
  incomplete: 'ce-tag--incomplete',
}

export default function ResultsPage() {
  const { state, isLoaded } = useAssessment()

  if (!isLoaded) return null

  const results = computeResults(state)

  const completedSections = results.sections.filter((s) => s.status !== 'incomplete')
  const passedSections = results.sections.filter((s) => s.status === 'pass')
  const failedSections = results.sections.filter((s) => s.status === 'fail')
  const incompleteSections = results.sections.filter((s) => s.status === 'incomplete')

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
          <li className="govuk-breadcrumbs__list-item">Results</li>
        </ol>
      </nav>

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">Your readiness results</h1>

          {/* Overall status panel */}
          {results.overallStatus === 'incomplete' ? (
            <div className="govuk-warning-text">
              <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
              <strong className="govuk-warning-text__text">
                <span className="govuk-visually-hidden">Warning</span>
                Assessment not complete — {incompleteSections.length} section
                {incompleteSections.length !== 1 ? 's' : ''} still to answer.{' '}
                <Link href="/assessment" className="govuk-link">Return to assessment</Link>
              </strong>
            </div>
          ) : results.overallStatus === 'pass' ? (
            <div
              className="govuk-panel govuk-panel--confirmation"
              style={{ background: '#00703c', marginBottom: '2rem' }}
            >
              <h2 className="govuk-panel__title">Likely ready for certification</h2>
              <div className="govuk-panel__body">
                Your answers indicate you meet the requirements across all five Cyber Essentials
                control areas. We recommend reviewing your responses with an accredited Certification
                Body before applying.
              </div>
            </div>
          ) : (
            <div
              className="govuk-panel"
              style={{ background: '#d4351c', color: 'white', marginBottom: '2rem', padding: '2rem' }}
            >
              <h2 className="govuk-panel__title">Remediation required</h2>
              <div className="govuk-panel__body">
                {results.criticalFailures > 0 && (
                  <p>
                    <strong>{results.criticalFailures} critical requirement{results.criticalFailures !== 1 ? 's' : ''}</strong> not met. These must be addressed before applying for certification.
                  </p>
                )}
                <p style={{ marginBottom: 0 }}>
                  Review the remediation guidance below and address the failing items before submitting for Cyber Essentials certification.
                </p>
              </div>
            </div>
          )}

          {/* Summary table */}
          <h2 className="govuk-heading-l">Summary by control area</h2>
          <table className="govuk-table">
            <thead className="govuk-table__head">
              <tr className="govuk-table__row">
                <th className="govuk-table__header">Control area</th>
                <th className="govuk-table__header govuk-table__header--numeric">Questions</th>
                <th className="govuk-table__header govuk-table__header--numeric">Passed</th>
                <th className="govuk-table__header govuk-table__header--numeric">Failed</th>
                <th className="govuk-table__header">Status</th>
              </tr>
            </thead>
            <tbody className="govuk-table__body">
              {results.sections.map((section) => (
                <tr className="govuk-table__row" key={section.sectionSlug}>
                  <td className="govuk-table__cell">
                    <Link href={`/assessment/${section.sectionSlug}`} className="govuk-link">
                      {section.title}
                    </Link>
                  </td>
                  <td className="govuk-table__cell govuk-table__cell--numeric">
                    {section.totalQuestions}
                  </td>
                  <td className="govuk-table__cell govuk-table__cell--numeric">
                    {section.status !== 'incomplete' ? section.passedQuestions : '–'}
                  </td>
                  <td className="govuk-table__cell govuk-table__cell--numeric">
                    {section.status !== 'incomplete'
                      ? section.failedQuestions + section.partialQuestions
                      : '–'}
                  </td>
                  <td className="govuk-table__cell">
                    <strong className={`govuk-tag ${statusTagClass[section.status]}`}>
                      {statusLabel[section.status]}
                    </strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Remediation detail */}
          {failedSections.length > 0 && (
            <>
              <h2 className="govuk-heading-l" style={{ marginTop: '2rem' }}>
                Remediation guidance
              </h2>
              <p className="govuk-body">
                The following requirements were not fully met. Address these before applying for
                Cyber Essentials certification.
              </p>

              {failedSections.map((section) => (
                <div key={section.sectionSlug} style={{ marginBottom: '2rem' }}>
                  <h3 className="govuk-heading-m">
                    {section.title}
                    {section.criticalFailures > 0 && (
                      <span className="ce-critical-badge">
                        {section.criticalFailures} critical
                      </span>
                    )}
                  </h3>

                  {section.failingQuestions.map((fq) => (
                    <div
                      key={fq.id}
                      style={{
                        borderLeft: '4px solid #d4351c',
                        paddingLeft: '1rem',
                        marginBottom: '1.25rem',
                      }}
                    >
                      <p className="govuk-body" style={{ marginBottom: '0.25rem' }}>
                        <strong>{fq.text}</strong>
                        {fq.weight === 'critical' && (
                          <span className="ce-critical-badge">Critical</span>
                        )}
                      </p>
                      <div className="ce-remediation">
                        <strong>Action required:</strong> {fq.remediationGuidance}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </>
          )}

          {/* Passed sections summary */}
          {passedSections.length > 0 && (
            <>
              <h2 className="govuk-heading-l" style={{ marginTop: '2rem' }}>
                Passing control areas
              </h2>
              <ul className="govuk-list govuk-list--bullet">
                {passedSections.map((s) => (
                  <li key={s.sectionSlug}>
                    <strong>{s.title}</strong> — all {s.totalQuestions} requirements met
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Disclaimer */}
          <div className="govuk-inset-text" style={{ marginTop: '2rem' }}>
            <h3 className="govuk-heading-s">Important disclaimer</h3>
            <p className="govuk-body">
              This tool provides a self-assessed readiness indicator only. It is not an official
              Cyber Essentials assessment and does not constitute or guarantee certification. Your
              actual certification status can only be determined by an{' '}
              <a
                href="https://iasme.co.uk/cyber-essentials/find-a-certification-body/"
                className="govuk-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                IASME-accredited Certification Body
              </a>
              .
            </p>
            <p className="govuk-body govuk-!-margin-bottom-0">
              &ldquo;Cyber Essentials&rdquo; is a registered trademark of DSIT. This tool is not
              affiliated with or endorsed by NCSC, IASME, or DSIT.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem' }}>
            <Link href="/assessment" className="govuk-button govuk-button--secondary">
              Return to assessment
            </Link>
          </div>
        </div>

        {/* Sidebar */}
        <div className="govuk-grid-column-one-third">
          <div style={{ position: 'sticky', top: '1rem' }}>
            <h2 className="govuk-heading-s">Next steps</h2>
            <p className="govuk-body-s">
              Once you&apos;ve addressed any failing requirements, apply for certification through
              an IASME-accredited Certification Body.
            </p>
            <a
              href="https://iasme.co.uk/cyber-essentials/find-a-certification-body/"
              className="govuk-button govuk-button--secondary govuk-!-margin-bottom-2"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'block', textAlign: 'center' }}
            >
              Find a Certification Body
            </a>
            <a
              href="https://www.ncsc.gov.uk/cyberessentials/overview"
              className="govuk-link govuk-body-s"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'block' }}
            >
              NCSC Cyber Essentials overview →
            </a>

            <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible" />

            <h2 className="govuk-heading-s">Score at a glance</h2>
            <dl className="govuk-summary-list govuk-summary-list--no-border">
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Completed</dt>
                <dd className="govuk-summary-list__value">
                  {completedSections.length}/{results.sections.length} sections
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Passing</dt>
                <dd className="govuk-summary-list__value">{passedSections.length} sections</dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Failing</dt>
                <dd className="govuk-summary-list__value">{failedSections.length} sections</dd>
              </div>
              {results.criticalFailures > 0 && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Critical gaps</dt>
                  <dd className="govuk-summary-list__value" style={{ color: '#d4351c', fontWeight: 700 }}>
                    {results.criticalFailures}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </>
  )
}
