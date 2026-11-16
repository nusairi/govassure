# GOV Assured Threat-Informed Defence Planner

A browser tool for planning threat-informed defence using MITRE ATT&CK and D3FEND, with an optional DeTT&CT upload. A Flask app serves the static page, the ATT&CK group data and the analysis API. It is served on [threat.govassured.com](https://threat.govassured.com) by an Azure Container App.

The page is part of [GOV Assured](https://www.govassured.com). The company repository is [github.com/nusairi/govassure](https://github.com/nusairi/govassure). The company page is on [LinkedIn](https://www.linkedin.com/company/102617034/).

## Files

- `app.py`: the Flask application (static files from `public/`, `/api/groups`, `/api/analyze`, `/api/d3fend`, security headers, the 404 page).
- `requirements.txt`: pinned Python dependencies, including gunicorn.
- `data/attack_data.json`: the ATT&CK data used by the APIs.
- `public/`: the published files (`index.html`, CSS, JavaScript, the GOV Assured brand bar assets, favicons, and a sample DeTT&CT file).
- `scripts/`: helpers to regenerate `data/attack_data.json` (not run by the build).
- `tools/Dockerfile`: the container image (python:3.12-slim, gunicorn, port 8080, user `nobody`).
- `tools/test.sh`: response checks run by the Dockerfile's `test` stage, and also runnable against a local `tools/build.sh` output with `ROOT=<out> PORT=<port> sh tools/test.sh`.

## Build

From this directory:

```bash
tools/build.sh . /tmp/threat-build
docker build -f tools/Dockerfile -t govassured-threat .
docker build -f tools/Dockerfile --target test .
docker run --rm -p 8080:8080 govassured-threat
```

`tools/build.sh` copies `app.py`, `requirements.txt`, `data/` and `public/` to the output folder (leaving out `tools/`, `scripts/`, `README.md` and `.gitignore`) and checks that the GOV Assured brand bar is on every page. There is no compile step.

## Deploy

The image is pushed to the container registry and deployed to Azure Container Apps. gunicorn listens on `PORT` (8080).
