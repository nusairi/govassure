# Security scanning

These checks analyse the repository. They do not deploy the site, change hosting, or add secrets, Azure configuration, or OIDC. Semgrep is not part of this round.

Report-only jobs use `continue-on-error: true`. They still print findings. They do not fail the workflow until that flag is removed and the job is marked required.

| Check | When it runs | Result on findings |
| --- | --- | --- |
| CodeQL | Pull requests to `main`, pushes to `main`, Mondays 06:17 UTC | Fails the job |
| Dependency review | Pull requests | Fails the job at severity high or above |
| npm audit and pip-audit | Pull requests, Mondays 07:17 UTC | Report-only |
| Gitleaks and Trivy | Pull requests, pushes to `main`, Mondays 06:47 UTC | Report-only |
| Dependabot | Weekly version updates | Opens pull requests |

Times are UTC.

## CodeQL

`.github/workflows/codeql.yml` runs CodeQL for `javascript-typescript` and `python`, both with `build-mode: none` (no compile step). Alerts are uploaded to GitHub code scanning.

The job token can read contents and actions, and can write security events. The workflow token otherwise has no permissions. Checkout does not persist credentials.

## Dependency review

`.github/workflows/dependency-review.yml` runs `actions/dependency-review-action` on pull requests. `fail-on-severity` is `high`, so a new dependency at high or critical fails the job. Moderate and low do not.

The action does not post a pull request comment (`comment-summary-in-pr` is unset). The job token therefore has `contents: read` and `pull-requests: read`.

A pull request that does not change a manifest passes. On `main` today the only manifest Dependabot watches is GitHub Actions.

Dependency graph has to be enabled in the repository code-security settings before this action can run. This change does not turn that setting on. Until it is on, the job fails at startup with "Dependency review is not supported on this repository."

## npm audit and pip-audit

`.github/workflows/sca-audit.yml` is report-only. The job and both scan steps set `continue-on-error: true` so one ecosystem still runs if the other finds advisories. Remove those flags after the known advisories are cleared, then make the job required.

The job looks for manifests one directory under `apps/`:

- `npm audit --omit=dev --audit-level=high` in each `apps/*/` that has a `package-lock.json`
- `pip-audit -r` for each `apps/*/requirements.txt`, using pip-audit 2.10.1 in a virtual environment

Folders that are not on the scanned revision are skipped. If none of those files exist, the step succeeds and says so.

On `main` there is no `package-lock.json` and no `requirements.txt`. `apps/quiz`, `apps/ce`, `apps/assessment`, and `apps/wiki` are not on `main`. This workflow will audit them when they are merged. No install of application dependencies is required for `npm audit` against a lockfile.

## Gitleaks

The secrets job installs Gitleaks CLI 8.30.1, checks the published SHA-256 of the Linux x64 archive, and runs:

```bash
gitleaks detect --redact --verbose --no-banner --exit-code 1
```

`--redact` replaces secret values in the log. Checkout uses `fetch-depth: 0` so the scan covers git history, not only the latest tree.

This job does not use `gitleaks-action`. That action also redacts, and it needs `GITHUB_TOKEN`, comments on pull requests unless comments are turned off, and a license secret for organization accounts. This change does not add secrets.

`.gitleaks.toml` extends the built-in rules. It allowlists one false positive from `generic-api-key`: the localStorage key `ga-osi-hw-depth-v1` on `DEPTH_KEY` in `apps/osi/tutorial.js` (on `feature/osi-update-source`, not on `main`). The allowlist is limited to that rule, that path, and that string. A local scan of every fetched commit after the allowlist reports no other leaks.

The Gitleaks step is report-only (`continue-on-error: true`).

## Trivy

The same report-only job runs Trivy twice, via `aquasecurity/trivy-action` at the commit for v0.36.0, with the Trivy version input set to v0.70.0. Cache is off so the job does not write to the Actions cache.

1. Filesystem scan with scanners `vuln`, `secret`, and `misconfig`, severity `HIGH,CRITICAL`, exit code 1 when findings exist. This step is report-only.
2. A second filesystem scan writes a CycloneDX SBOM to `sbom.cdx.json` (`list-all-pkgs: true`, no severity filter, so the inventory is not limited to vulnerable packages). `actions/upload-artifact` uploads it as `cyclonedx-sbom`.

The SBOM steps do not set their own `continue-on-error`. The job does, so a failure there still does not fail the workflow during this round. The scan steps set `continue-on-error` so a finding does not skip the SBOM.

## Dependabot

`.github/dependabot.yml` opens grouped version updates once a week, with a cooldown of 7 days (`cooldown.default-days`).

The only ecosystem on `main` is `github-actions` at `/`. npm and pip entries are omitted until a directory on `main` has a lockfile or a `requirements.txt`. Adding those directories later does not require a change to the audit workflow. It does require a new Dependabot entry, because Dependabot does not take a glob of directories.

## Pinned actions

Every third-party action is pinned to a full commit SHA, with the release tag in a comment. Checkout sets `persist-credentials: false`. Each workflow starts from `permissions: {}` and grants only the job permissions named above.
