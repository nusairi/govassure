# threat.govassured.com: Flask/gunicorn app for the Threat-Informed Defence Planner.
# Build from apps/threat:
#   docker build -f tools/Dockerfile -t govassured-threat .
FROM python:3.12-slim AS final
RUN apt-get update && apt-get upgrade -y --no-install-recommends && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && pip uninstall -y pip setuptools wheel || true
COPY app.py ./
COPY data ./data
COPY public ./public
ENV PORT=8080
EXPOSE 8080
USER nobody
CMD ["sh", "-c", "exec gunicorn -w 2 -b 0.0.0.0:${PORT} --timeout 60 app:app"]

# Optional: docker build -f tools/Dockerfile --target test . runs the response checks.
FROM final AS test
USER root
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
COPY tools/test.sh /test.sh
USER nobody
ENV PORT=8080
RUN sh /test.sh
