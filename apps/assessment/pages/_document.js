import { Html, Head, Main, NextScript } from "next/document";

// The GOV Assured brand bar, at the top of every page. Its styles (and the ga-* stylesheet and script
// links) are added to <head> after the build by tools/postbuild.mjs, from tools/ga-brand.css.
const brandBar =
  '<a class="ga-brandbar__home" href="https://www.govassured.com/">' +
  '<img src="/ga-logo.png" width="95" height="30" alt="GOV Assured home"></a>';

export default function Document() {
  return (
    <Html lang="en-GB" className="govuk-template">
      <Head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="stylesheet" href="/govuk-frontend.min.css" />
      </Head>
      <body className="govuk-template__body">
        <div className="ga-brandbar" dangerouslySetInnerHTML={{ __html: brandBar }} />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
