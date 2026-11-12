import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Accessibility statement',
}

export default function AccessibilityPage() {
  return (
    <>
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item">
            <Link className="govuk-breadcrumbs__link" href="/">Home</Link>
          </li>
          <li className="govuk-breadcrumbs__list-item">Accessibility statement</li>
        </ol>
      </nav>

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">Accessibility statement</h1>

          <p className="govuk-body">
            This accessibility statement applies to{' '}
            <a href="https://ce.govassured.com" className="govuk-link">ce.govassured.com</a>.
          </p>

          <p className="govuk-body">
            This website is run by the GOV Assured open source community. We want as many people as
            possible to be able to use this website. For example, that means you should be able to:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>change colours, contrast levels and fonts using browser or device settings</li>
            <li>zoom in up to 400% without the text spilling off the screen</li>
            <li>navigate most of the website using a keyboard or speech recognition software</li>
            <li>listen to most of the website using a screen reader</li>
          </ul>

          <h2 className="govuk-heading-l">How accessible this website is</h2>

          <p className="govuk-body">
            This website uses the{' '}
            <a href="https://design-system.service.gov.uk/" className="govuk-link" target="_blank" rel="noopener noreferrer">
              GOV.UK Design System
            </a>{' '}
            which is designed and tested for accessibility. We believe this website is currently
            accessible, but we have not yet carried out a formal accessibility audit.
          </p>

          <h2 className="govuk-heading-l">Feedback and contact information</h2>

          <p className="govuk-body">
            If you find any problems not listed on this page or think we&apos;re not meeting
            accessibility requirements, please{' '}
            <a
              href="https://www.linkedin.com/company/102617034/"
              className="govuk-link"
              target="_blank"
              rel="noopener"
              aria-label="GOV Assured on LinkedIn"
            >
              contact GOV Assured on LinkedIn
            </a>
            .
          </p>

          <h2 className="govuk-heading-l">Technical information about this website&apos;s accessibility</h2>

          <p className="govuk-body">
            The GOV Assured community is committed to making this website accessible, in accordance
            with the Public Sector Bodies (Websites and Mobile Applications) (No. 2) Accessibility
            Regulations 2018.
          </p>

          <h3 className="govuk-heading-m">Compliance status</h3>

          <p className="govuk-body">
            This website has not yet been formally audited against the Web Content Accessibility
            Guidelines (WCAG) version 2.2 AA standard. We intend to commission an audit and update
            this statement with the results.
          </p>

          <h2 className="govuk-heading-l">Preparation of this accessibility statement</h2>

          <p className="govuk-body">
            This statement was prepared in June 2025. It will be reviewed and updated following a
            formal accessibility audit.
          </p>
        </div>
      </div>
    </>
  )
}
