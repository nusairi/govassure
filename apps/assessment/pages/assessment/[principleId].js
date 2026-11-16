import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "../../components/Layout";
import { loadAssessment, saveAssessment } from "../../lib/storage";
import { ALL_PRINCIPLES, CAF, getScoreOptions, SCORES } from "../../data/caf";

function ScoreRadio({ igp, value, notes, onChange, onNotesChange }) {
  const options = getScoreOptions(igp);
  const groupId = `score-${igp.id}`;

  return (
    <div className={`ga-igp-card ${value ? `ga-igp-card--${value}` : ""}`}>
      {/* IGP header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
        <div>
          <span className="govuk-caption-m" style={{ marginBottom: 2 }}>
            {igp.code}
          </span>
          <h3 className="govuk-heading-s" style={{ marginBottom: 4 }}>
            {igp.title}
          </h3>
        </div>
        {value && (
          <span
            className="ga-score-badge"
            style={{ background: SCORES[value]?.colour, flexShrink: 0, marginTop: 4 }}
          >
            {SCORES[value]?.label}
          </span>
        )}
      </div>

      <p className="govuk-body" style={{ color: "#505a5f", marginBottom: 16 }}>
        {igp.description}
      </p>

      {/* Radio buttons */}
      <div className="govuk-form-group" style={{ marginBottom: 16 }}>
        <fieldset className="govuk-fieldset">
          <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
            Assessment outcome
          </legend>
          <div className="govuk-radios govuk-radios--inline govuk-radios--small">
            {options.map((opt) => (
              <div key={opt.value} className="govuk-radios__item">
                <input
                  className="govuk-radios__input"
                  id={`${groupId}-${opt.value}`}
                  name={groupId}
                  type="radio"
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={() => onChange(igp.id, opt.value)}
                />
                <label className="govuk-label govuk-radios__label" htmlFor={`${groupId}-${opt.value}`}>
                  {opt.label}
                </label>
              </div>
            ))}
          </div>
        </fieldset>
      </div>

      {/* Notes textarea */}
      <div className="govuk-form-group" style={{ marginBottom: 0 }}>
        <label className="govuk-label govuk-label--s" htmlFor={`notes-${igp.id}`}>
          Evidence / notes <span style={{ fontWeight: 400, color: "#505a5f" }}>(optional)</span>
        </label>
        <textarea
          className="govuk-textarea"
          id={`notes-${igp.id}`}
          rows={3}
          value={notes || ""}
          onChange={(e) => onNotesChange(igp.id, e.target.value)}
          placeholder="Describe the evidence or controls in place…"
          style={{ marginBottom: 0 }}
        />
      </div>
    </div>
  );
}

export default function PrinciplePage() {
  const router = useRouter();
  const { principleId } = router.query;

  const [assessment, setAssessment] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const a = loadAssessment();
    if (!a) {
      router.push("/");
      return;
    }
    setAssessment(a);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save with debounce
  const persist = useCallback(
    (updated) => {
      saveAssessment(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
    []
  );

  function handleScoreChange(igpId, score) {
    setAssessment((prev) => {
      const updated = {
        ...prev,
        meta: { ...prev.meta, updatedAt: new Date().toISOString() },
        responses: {
          ...prev.responses,
          [igpId]: { ...(prev.responses[igpId] || {}), score },
        },
      };
      persist(updated);
      return updated;
    });
  }

  function handleNotesChange(igpId, notes) {
    setAssessment((prev) => {
      const updated = {
        ...prev,
        meta: { ...prev.meta, updatedAt: new Date().toISOString() },
        responses: {
          ...prev.responses,
          [igpId]: { ...(prev.responses[igpId] || {}), notes },
        },
      };
      persist(updated);
      return updated;
    });
  }

  if (!assessment || !principleId) return null;

  // Resolve principle
  const principle = ALL_PRINCIPLES.find((p) => p.id.toLowerCase() === principleId.toLowerCase());
  if (!principle) {
    return (
      <Layout title="Not found">
        <h1 className="govuk-heading-xl">Principle not found</h1>
        <Link href="/assessment" className="govuk-link">
          Back to overview
        </Link>
      </Layout>
    );
  }

  // Find adjacent principles for prev/next navigation
  const allPrinciples = CAF.flatMap((obj) => obj.principles);
  const currentIndex = allPrinciples.findIndex((p) => p.id.toLowerCase() === principleId.toLowerCase());
  const prevPrinciple = currentIndex > 0 ? allPrinciples[currentIndex - 1] : null;
  const nextPrinciple = currentIndex < allPrinciples.length - 1 ? allPrinciples[currentIndex + 1] : null;

  // Get the objective for colour
  const objective = CAF.find((obj) => obj.id === principle.objectiveId);

  const { responses } = assessment;

  // Completion stats for this principle
  const totalIgps = principle.igps.length;
  const answeredIgps = principle.igps.filter((igp) => responses[igp.id]?.score).length;
  const pct = Math.round((answeredIgps / totalIgps) * 100);

  return (
    <Layout title={`${principle.id} – ${principle.title}`}>
      {/* Breadcrumb */}
      <div className="govuk-breadcrumbs" style={{ marginBottom: 24 }}>
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item">
            <Link href="/" className="govuk-breadcrumbs__link">Home</Link>
          </li>
          <li className="govuk-breadcrumbs__list-item">
            <Link href="/assessment" className="govuk-breadcrumbs__link">Assessment overview</Link>
          </li>
          <li className="govuk-breadcrumbs__list-item">
            {principle.id} – {principle.title}
          </li>
        </ol>
      </div>

      {/* Heading */}
      <div
        style={{
          borderLeft: `6px solid ${objective?.colour || "#1d70b8"}`,
          paddingLeft: 16,
          marginBottom: 8,
        }}
      >
        <p className="govuk-caption-l" style={{ marginBottom: 2 }}>
          Objective {principle.objectiveId} — {principle.objectiveTitle}
        </p>
        <h1 className="govuk-heading-xl ga-mb-0">
          {principle.id} – {principle.title}
        </h1>
      </div>

      <p className="govuk-body" style={{ color: "#505a5f", maxWidth: 720, marginBottom: 8 }}>
        {principle.description}
      </p>

      {/* Progress */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
        <div className="ga-progress" style={{ flex: 1, maxWidth: 300 }}>
          <div
            className="ga-progress__fill"
            style={{ width: `${pct}%`, background: pct === 100 ? "#00703c" : "#1d70b8" }}
          />
        </div>
        <span className="govuk-body-s ga-caption">
          {answeredIgps}/{totalIgps} IGPs answered
        </span>
        {saved && (
          <span className="govuk-body-s" style={{ color: "#00703c" }}>
            ✓ Saved
          </span>
        )}
      </div>

      {/* IGP cards */}
      {principle.igps.map((igp) => (
        <ScoreRadio
          key={igp.id}
          igp={igp}
          value={responses[igp.id]?.score || null}
          notes={responses[igp.id]?.notes || ""}
          onChange={handleScoreChange}
          onNotesChange={handleNotesChange}
        />
      ))}

      {/* Navigation */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginTop: 32,
          paddingTop: 24,
          borderTop: "1px solid #b1b4b6",
        }}
      >
        <div>
          {prevPrinciple ? (
            <Link
              href={`/assessment/${prevPrinciple.id.toLowerCase()}`}
              className="govuk-link"
              style={{ fontSize: 16 }}
            >
              ← Previous: {prevPrinciple.id} {prevPrinciple.title}
            </Link>
          ) : (
            <span />
          )}
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/assessment" className="govuk-button govuk-button--secondary" style={{ marginBottom: 0 }}>
            Overview
          </Link>
          {nextPrinciple ? (
            <Link
              href={`/assessment/${nextPrinciple.id.toLowerCase()}`}
              className="govuk-button"
              style={{ marginBottom: 0 }}
            >
              Next: {nextPrinciple.id} {nextPrinciple.title} →
            </Link>
          ) : (
            <Link href="/results" className="govuk-button" style={{ marginBottom: 0 }}>
              View results →
            </Link>
          )}
        </div>
      </div>
    </Layout>
  );
}

// Static export: one page per principle (/assessment/a1/ … /assessment/d2/)
export async function getStaticPaths() {
  return { paths: ALL_PRINCIPLES.map((p) => ({ params: { principleId: p.id.toLowerCase() } })), fallback: false };
}
export async function getStaticProps() {
  return { props: {} };
}
