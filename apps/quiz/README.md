# GOV Assured AI Safety Practice Quiz

A practice quiz covering AI safety, security, governance and ethics across 12 modules, with exam-style multiple choice questions, explanations and a timed full-exam mode. It is a Next.js app exported as static files and served on [quiz.govassured.com](https://quiz.govassured.com) by an nginx container on Azure Container Apps.

The quiz is part of [GOV Assured](https://www.govassured.com). The company repository is [github.com/nusairi/govassure](https://github.com/nusairi/govassure). The company page is on [LinkedIn](https://www.linkedin.com/company/102617034/).

## Files

- `app/`: the App Router shell (`layout.tsx` with the metadata and the GOV Assured brand bar, `page.tsx`, `globals.css` with Tailwind and the brand bar styles, `icon.svg`).
- `components/QuizApp.tsx`: the quiz logic and UI (one client component, with the theme switcher and the GOV Assured LinkedIn link in the footer).
- `data/questions.ts`: the questions, answers and explanations.
- `public/`: `ga-logo.png` and the shared GOV Assured `ga-theme.css`, `ga-app.css` and `ga-sources.js`.
- `next.config.js`: static export (`output: 'export'`, trailing slashes, unoptimised images); `NEXT_BUILD_ID` pins the build ID.
- `package.json`, `package-lock.json`: Next.js 15.5.18, React, Tailwind CSS 3, TypeScript.
- `LICENSE`: the MIT licence of the original quiz, unchanged.
- `tools/postbuild.mjs`: edits to the exported HTML after `next build`: `<html lang="en-GB">`, and links to the ga-* files at the end of `<head>` with `?v=` set to the first 10 hex digits of each file's SHA-256.
- `tools/build.sh`: copies the source to a clean build folder, runs `npm ci`, `next build` and `tools/postbuild.mjs`, copies `out/` to the output folder and checks that the brand bar is on every page.
- `tools/nginx/default.conf.template`: the nginx server block (gzip, cache policy by path, `root /sites/${SITE}`).
- `tools/nginx/quiz.conf`: this site's headers (HSTS, nosniff, X-Frame-Options, Referrer-Policy; no CSP, as on the live site), `/healthz`, clean URLs and the 404 page.
- `tools/Dockerfile`: a Node build stage, then the image (nginx-unprivileged on Alpine, port 8080, `SITE=quiz`).
- `tools/test.sh`: response checks run by the Dockerfile's `test` stage.

## Develop

```bash
npm ci
npm run dev        # http://localhost:3000
```

## Build

From this directory (needs Node.js 24 and npm):

```bash
tools/build.sh . /tmp/quiz-build                          # the site files nginx serves
docker build -f tools/Dockerfile -t govassured-quiz .     # the image
docker build -f tools/Dockerfile --target test .          # the image plus the response checks
docker run --rm -p 8080:8080 govassured-quiz              # then open http://localhost:8080/
```

### Reproducing the live files exactly

Next.js names its JavaScript chunks by content hashes that depend on the absolute path of the build folder, and it picks a random build ID. The files on quiz.govassured.com were built in `/workspace/p2/ai-safety-quiz` with the build ID `Lx0OvJqSehihVu2KxAnEV`. With the same two values the output is byte-identical to the live site (31 files):

```bash
docker build -f tools/Dockerfile --build-arg NEXT_BUILD_ID=Lx0OvJqSehihVu2KxAnEV \
  --build-arg QUIZ_BUILD_DIR=/workspace/p2/ai-safety-quiz -t govassured-quiz .
```

Any other folder gives the same pages, styles and behaviour, with different chunk file names.

## Adding questions

Edit `data/questions.ts`. Each question follows this structure:

```typescript
{
  id: "M1-Q6",           // unique ID
  module: 1,             // 1–12
  moduleName: MODULE_NAMES[1],
  text: "Question text here?",
  options: [
    { letter: "A", text: "First option" },
    { letter: "B", text: "Second option" },
    { letter: "C", text: "Third option" },
    { letter: "D", text: "Fourth option" },
  ],
  correctAnswer: "B",    // the correct letter
  explanation: "Why B is correct...",
  justifications: {
    A: "Why A is wrong...",
    B: "Why B is correct...",
    C: "Why C is wrong...",
    D: "Why D is wrong...",
  },
}
```

## Deploy

The image is pushed to the container registry and deployed to Azure Container Apps. The nginx image's entrypoint renders the template with `SITE=quiz` when the container starts.
