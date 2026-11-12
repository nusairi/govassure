import Link from 'next/link'

export default function GovHeader() {
  return (
    <header className="govuk-header" role="banner" data-module="govuk-header">
      <div className="govuk-header__container govuk-width-container">
        <div className="govuk-header__logo">
          <Link href="/" className="govuk-header__link govuk-header__link--homepage">
            <span className="govuk-header__logotype">
              <svg
                aria-label="GOV Assured shield"
                focusable="false"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                height="30"
                width="26"
                style={{ marginRight: '4px', verticalAlign: 'middle' }}
              >
                <path
                  fill="currentColor"
                  d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"
                />
              </svg>
            </span>
            <span className="govuk-header__product-name">CE Readiness</span>
          </Link>
        </div>
        <div className="govuk-header__content">
          <nav aria-label="Menu">
            <ul className="govuk-header__navigation-list">
              <li className="govuk-header__navigation-item">
                <Link className="govuk-header__link" href="/">
                  Home
                </Link>
              </li>
              <li className="govuk-header__navigation-item">
                <Link className="govuk-header__link" href="/assessment">
                  Assessment
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  )
}
