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
        <link rel="icon" href="/favicon.ico?v=08e5767b65" sizes="48x48" />
        <link rel="icon" href="/favicon.svg?v=2b46852867" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=eea7edda9b" />
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
