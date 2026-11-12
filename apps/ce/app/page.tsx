import type { Metadata } from 'next'
import Link from 'next/link'
import { sections } from '@/data/questions'

export const metadata: Metadata = {
  title: 'CE Readiness – Cyber Essentials Preparation Tool',
}

export default function HomePage() {
  return (
    <>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">
            Cyber Essentials Readiness Tool
          </h1>

          <div className="govuk-inset-text">
            <p className="govuk-body">
              <strong>Not an official assessment.</strong> This tool helps you prepare for Cyber
              Essentials certification. Official certification must be obtained through an{' '}
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
          </div>

          <p className="govuk-body-l">
            Work through the five Cyber Essentials control areas at your own pace. See where your
            organisation is ready and where remediation is needed before you apply for certification.
          </p>

          <p className="govuk-body">
            Your answers are saved in your browser — you can close the page and return to resume
            later. No account required, nothing is sent to a server.
          </p>

          <Link href="/assessment" className="govuk-button govuk-button--start" role="button">
            Start assessment
            <svg
              className="govuk-button__start-icon"
              xmlns="http://www.w3.org/2000/svg"
              width="17.5"
              height="19"
              viewBox="0 0 33 40"
              aria-hidden="true"
              focusable="false"
            >
              <path fill="currentColor" d="M0 0h13l20 20-20 20H0l20-20z" />
            </svg>
          </Link>
        </div>

        <div className="govuk-grid-column-one-third">
          <div className="govuk-panel govuk-panel--confirmation" style={{ background: '#1d70b8', marginTop: 0 }}>
            <h2 className="govuk-panel__title" style={{ fontSize: '1.2rem' }}>
              5 control areas
            </h2>
            <div className="govuk-panel__body">
              {sections.reduce((acc, s) => acc + s.questions.length, 0)} questions total
            </div>
          </div>
        </div>
      </div>

      <div className="govuk-grid-row" style={{ marginTop: '2rem' }}>
        <div className="govuk-grid-column-full">
          <h2 className="govuk-heading-l">The five control areas</h2>
          <div className="govuk-grid-row">
            {sections.map((section, i) => (
              <div className="govuk-grid-column-one-half" key={section.id} style={{ marginBottom: '1.5rem' }}>
                <div className="ce-section-card">
                  <h3 className="govuk-heading-m" style={{ marginBottom: '0.5rem' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        background: '#1d70b8',
                        color: 'white',
                        borderRadius: '50%',
                        width: '1.75rem',
                        height: '1.75rem',
                        lineHeight: '1.75rem',
                        textAlign: 'center',
                        fontSize: '0.9rem',
                        marginRight: '0.5rem',
                        fontWeight: 700,
                      }}
                    >
                      {i + 1}
                    </span>
                    {section.title}
                  </h3>
                  <p className="govuk-body-s" style={{ margin: 0 }}>
                    {section.description.split('.')[0]}.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="govuk-grid-row" style={{ marginTop: '1rem' }}>
        <div className="govuk-grid-column-two-thirds">
          <h2 className="govuk-heading-m">About this tool</h2>
          <p className="govuk-body">
            This is a free, open-source readiness tool. It is not affiliated with or endorsed by
            NCSC, IASME, or DSIT. Question content is based on NCSC Cyber Essentials technical
            requirements published under the Open Government Licence v3.0.
          </p>
          <p className="govuk-body">
            &ldquo;Cyber Essentials&rdquo; is a registered trademark of DSIT. Use of this term is
            descriptive only and does not imply endorsement.
          </p>
        </div>
      </div>
    </>
  )
}
