import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import { loadAssessment, saveAssessment, createEmptyAssessment, mergeAssessment, countResponded } from "../lib/storage";
import { TOTAL_IGPS } from "../data/caf";

export default function Home() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [existing, setExisting] = useState(null);
  const [orgName, setOrgName] = useState("");
  const [assessorName, setAssessorName] = useState("");
  const [assessmentDate, setAssessmentDate] = useState(new Date().toISOString().slice(0, 10));
  const [errors, setErrors] = useState({});
  const [importError, setImportError] = useState("");

  useEffect(() => {
    const saved = loadAssessment();
    if (saved) {
      setExisting(saved);
      setOrgName(saved.meta?.organisationName || "");
      setAssessorName(saved.meta?.assessorName || "");
      setAssessmentDate(saved.meta?.assessmentDate || new Date().toISOString().slice(0, 10));
    }
  }, []);

  function validate() {
    const errs = {};
    if (!orgName.trim()) errs.orgName = "Enter an organisation name";
    if (!assessmentDate) errs.assessmentDate = "Enter a date";
    return errs;
  }

  function handleStart(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    const assessment = createEmptyAssessment({
      organisationName: orgName.trim(),
      assessorName: assessorName.trim(),
      assessmentDate,
    });
    saveAssessment(assessment);
    router.push("/assessment");
  }

  function handleResume(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    const updated = {
      ...existing,
      meta: {
        ...existing.meta,
        organisationName: orgName.trim(),
        assessorName: assessorName.trim(),
        assessmentDate,
        updatedAt: new Date().toISOString(),
      },
    };
    saveAssessment(updated);
    router.push("/assessment");
  }

  function handleImport() {
    setImportError("");
    fileInputRef.current?.click();
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!parsed.meta || !parsed.responses) throw new Error("Invalid file format");
        const merged = mergeAssessment(parsed);
        saveAssessment(merged);
        router.push("/assessment");
      } catch {
        setImportError("Could not import file. Please check it is a valid GOV Assured JSON export.");
      }
    };
    reader.readAsText(file);
    // reset so same file can be re-selected
    e.target.value = "";
  }

  const respondedCount = existing ? countResponded(existing.responses) : 0;
  const progress = existing ? Math.round((respondedCount / TOTAL_IGPS) * 100) : 0;

  return (
    <Layout title="Home">
      <div style={{ maxWidth: 680 }}>
        {/* Page heading */}
        <h1 className="govuk-heading-xl" style={{ marginBottom: 8 }}>
          NCSC CAF v4.0 Self-Assessment
        </h1>
        <p className="govuk-body-l">
          Assess your organisation&apos;s cyber security posture against the full NCSC Cyber Assessment Framework v4.0 &mdash; all 4
          objectives, 14 principles and {TOTAL_IGPS} Indicators of Good Practice.
        </p>

        {/* Existing session banner */}
        {existing && (
          <div className="govuk-notification-banner govuk-notification-banner--success" role="region" aria-label="Saved assessment found">
            <div className="govuk-notification-banner__header">
              <h2 className="govuk-notification-banner__title">Saved assessment found</h2>
            </div>
            <div className="govuk-notification-banner__content">
              <p className="govuk-body">
                <strong>{existing.meta?.organisationName || "Unnamed organisation"}</strong> — {respondedCount} of{" "}
                {TOTAL_IGPS} IGPs answered ({progress}% complete)
              </p>
              <div className="ga-progress" style={{ marginBottom: 12 }}>
                <div
                  className="ga-progress__fill"
                  style={{ width: `${progress}%`, background: progress === 100 ? "#00703c" : "#1d70b8" }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form noValidate>
          <div className={`govuk-form-group ${errors.orgName ? "govuk-form-group--error" : ""}`}>
            <label className="govuk-label govuk-label--s" htmlFor="orgName">
              Organisation name
            </label>
            {errors.orgName && (
              <p className="govuk-error-message">
                <span className="govuk-visually-hidden">Error: </span>
                {errors.orgName}
              </p>
            )}
            <input
              className={`govuk-input ${errors.orgName ? "govuk-input--error" : ""}`}
              id="orgName"
              type="text"
              value={orgName}
              onChange={(e) => {
                setOrgName(e.target.value);
                if (errors.orgName) setErrors((prev) => ({ ...prev, orgName: undefined }));
              }}
              autoComplete="organization"
              style={{ maxWidth: 400 }}
            />
          </div>

          <div className="govuk-form-group">
            <label className="govuk-label govuk-label--s" htmlFor="assessorName">
              Assessor name (optional)
            </label>
            <input
              className="govuk-input"
              id="assessorName"
              type="text"
              value={assessorName}
              onChange={(e) => setAssessorName(e.target.value)}
              autoComplete="name"
              style={{ maxWidth: 400 }}
            />
          </div>

          <div className={`govuk-form-group ${errors.assessmentDate ? "govuk-form-group--error" : ""}`}>
            <label className="govuk-label govuk-label--s" htmlFor="assessmentDate">
              Assessment date
            </label>
            {errors.assessmentDate && (
              <p className="govuk-error-message">
                <span className="govuk-visually-hidden">Error: </span>
                {errors.assessmentDate}
              </p>
            )}
            <input
              className={`govuk-input govuk-date-input__input ${errors.assessmentDate ? "govuk-input--error" : ""}`}
              id="assessmentDate"
              type="date"
              value={assessmentDate}
              onChange={(e) => {
                setAssessmentDate(e.target.value);
                if (errors.assessmentDate) setErrors((prev) => ({ ...prev, assessmentDate: undefined }));
              }}
              style={{ maxWidth: 200 }}
            />
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
            {existing ? (
              <>
                <button className="govuk-button" onClick={handleResume}>
                  Resume assessment
                </button>
                <button
                  className="govuk-button govuk-button--secondary"
                  onClick={handleStart}
                  type="button"
                >
                  Start new assessment
                </button>
              </>
            ) : (
              <button className="govuk-button" onClick={handleStart}>
                Start assessment
              </button>
            )}
          </div>
        </form>

        {/* Import */}
        <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible" />
        <h2 className="govuk-heading-m">Import a saved assessment</h2>
        <p className="govuk-body">
          Load a previously exported JSON file to continue an assessment or view results.
        </p>
        {importError && (
          <div className="govuk-error-summary" role="alert">
            <h2 className="govuk-error-summary__title">There is a problem</h2>
            <div className="govuk-error-summary__body">
              <p className="govuk-body">{importError}</p>
            </div>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <button className="govuk-button govuk-button--secondary" type="button" onClick={handleImport}>
          Import JSON file
        </button>

        {/* About */}
        <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible" />
        <h2 className="govuk-heading-m">About this tool</h2>
        <ul className="govuk-list govuk-list--bullet">
          <li>Covers all {TOTAL_IGPS} IGPs across 4 objectives and 14 principles of CAF v4.0</li>
          <li>Progress is automatically saved to your browser — no account needed</li>
          <li>Export your assessment at any time as a JSON file for sharing or backup</li>
          <li>No data is sent to any server — everything stays on your device</li>
        </ul>
      </div>
    </Layout>
  );
}
