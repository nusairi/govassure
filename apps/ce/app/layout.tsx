import type { Metadata } from 'next'
import './globals.css'
import GovHeader from '@/components/GovHeader'
import GovFooter from '@/components/GovFooter'
import { AssessmentProvider } from '@/context/AssessmentContext'

export const metadata: Metadata = {
  title: {
    template: '%s – CE Readiness',
    default: 'CE Readiness – Cyber Essentials Preparation Tool',
  },
  description:
    'Free open-source tool to help UK organisations prepare for Cyber Essentials certification. Not an official assessment.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="govuk-template">
      <head>
        {/* govuk-frontend loaded from CDN to ensure fonts are served correctly */}
        <link
          rel="stylesheet"
          href="/govuk-frontend.min.css"
        />
      </head>
      <body className="govuk-template__body">
        <a href="#main-content" className="govuk-skip-link">
          Skip to main content
        </a>
        <div className="ga-brandbar"><a className="ga-brandbar__home" href="https://www.govassured.com/"><img src="/ga-logo.png" width={95} height={30} alt="GOV Assured home" /></a></div>
        <AssessmentProvider>
          <GovHeader />
          <div className="govuk-width-container">
            <div className="govuk-phase-banner">
              <p className="govuk-phase-banner__content">
                <strong className="govuk-tag govuk-phase-banner__content__tag">Beta</strong>
                <span className="govuk-phase-banner__text">
                  This is a working tool to help organisations prepare for Cyber Essentials
                  certification. Your responses are stored in this browser only — nothing is sent
                  to a server.{' '}
                  <a
                    href="https://www.linkedin.com/company/102617034/"
                    className="govuk-link"
                    target="_blank"
                    rel="noopener"
                    aria-label="GOV Assured on LinkedIn"
                  >
                    Give feedback to GOV Assured on LinkedIn
                  </a>
                  .
                </span>
              </p>
            </div>
            <main className="govuk-main-wrapper" id="main-content">
              {children}
            </main>
          </div>
          <GovFooter />
        </AssessmentProvider>
      </body>
    </html>
  )
}
