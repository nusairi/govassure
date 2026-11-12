import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "../components/Layout";
import { loadAssessment } from "../lib/storage";
import { CAF, ALL_IGPS, TOTAL_IGPS, SCORES } from "../data/caf";
import { generateWordDoc } from "../lib/wordExport";

function PrincipleResultRow({ principle, responses, objectiveColour }) {
  const stats = { achieved: 0, partial: 0, notAchieved: 0, notStarted: 0 };
  principle.igps.forEach((igp) => {
    const r = responses[igp.id];
    if (!r?.score) stats.notStarted++;
    else if (r.score === "achieved") stats.achieved++;
    else if (r.score === "partially_achieved") stats.partial++;
    else stats.notAchieved++;
  });
  const total = principle.igps.length;
  return (
    <tr className="govuk-table__row">
      <td className="govuk-table__cell">
        <Link href={`/assessment/${principle.id.toLowerCase()}`} className="govuk-link">
          <strong>{principle.id}</strong> {principle.title}
        </Link>
      </td>
      <td className="govuk-table__cell govuk-table__cell--numeric">
        <span style={{ color: "#00703c", fontWeight: 700 }}>{stats.achieved}</span>
      </td>
      <td className="govuk-table__cell govuk-table__cell--numeric">
        <span style={{ color: "#f47738", fontWeight: stats.partial > 0 ? 700 : 400 }}>{stats.partial}</span>
      </td>
      <td className="govuk-table__cell govuk-table__cell--numeric">
        <span style={{ color: "#d4351c", fontWeight: stats.notAchieved > 0 ? 700 : 400 }}>{stats.notAchieved}</span>
      </td>
      <td className="govuk-table__cell govuk-table__cell--numeric">
        <span style={{ color: "#505a5f" }}>{stats.notStarted}</span>
      </td>
      <td className="govuk-table__cell govuk-table__cell--numeric">{total}</td>
    </tr>
  );
}

function IgpDetailTable({ igps, responses }) {
  return (
    <table className="govuk-table" style={{ fontSize: 14 }}>
      <thead className="govuk-table__head">
        <tr className="govuk-table__row">
          <th className="govuk-table__header" style={{ width: "8%" }}>IGP</th>
          <th className="govuk-table__header">Title</th>
          <th className="govuk-table__header" style={{ width: "18%" }}>Outcome</th>
          <th className="govuk-table__header">Notes</th>
        </tr>
      </thead>
      <tbody className="govuk-table__body">
        {igps.map((igp) => {
          const r = responses[igp.id];
          const score = r?.score;
          const scoreInfo = score ? SCORES[score] : null;
          return (
            <tr className="govuk-table__row" key={igp.id}>
              <td className="govuk-table__cell"><strong>{igp.code}</strong></td>
              <td className="govuk-table__cell">{igp.title}</td>
              <td className="govuk-table__cell">
                {scoreInfo ? (
                  <span className="ga-score-badge" style={{ background: scoreInfo.colour, fontSize: 12, padding: "2px 8px" }}>
                    {scoreInfo.label}
                  </span>
                ) : (
                  <span style={{ color: "#505a5f", fontSize: 12 }}>Not started</span>
                )}
              </td>
              <td className="govuk-table__cell" style={{ color: "#505a5f" }}>{r?.notes || "—"}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default function ResultsPage() {
  const router = useRouter();
  const [assessment, setAssessment] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [exported, setExported] = useState(false);

  useEffect(() => {
    const saved = loadAssessment();
    if (!saved) { router.push("/"); return; }
    setAssessment(saved);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleWordExport() {
    if (!assessment) return;
    generateWordDoc(assessment);
  }

  function handlePrint() {
    window.print();
  }

  function handleExport() {
    if (!assessment) return;
    const blob = new Blob([JSON.stringify(assessment, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const orgSlug = (assessment.meta?.organisationName || "govassure")
      .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const dateSlug = assessment.meta?.assessmentDate || new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `govassure-caf-${orgSlug}-${dateSlug}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  }

  if (!assessment) return null;

  const { meta, responses } = assessment;

  let totalAchieved = 0, totalPartial = 0, totalNotAchieved = 0, totalNotStarted = 0;
  ALL_IGPS.forEach((igp) => {
    const r = responses[igp.id];
    if (!r?.score) totalNotStarted++;
    else if (r.score === "achieved") totalAchieved++;
    else if (r.score === "partially_achieved") totalPartial++;
    else totalNotAchieved++;
  });

  const completed = TOTAL_IGPS - totalNotStarted;
  const pct = Math.round((completed / TOTAL_IGPS) * 100);

  return (
    <Layout title="Results">
      <div className="govuk-breadcrumbs" style={{ marginBottom: 24 }}>
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item">
            <Link href="/" className="govuk-breadcrumbs__link">Home</Link>
          </li>
          <li className="govuk-breadcrumbs__list-item">
            <Link href="/assessment" className="govuk-breadcrumbs__link">Assessment overview</Link>
          </li>
          <li className="govuk-breadcrumbs__list-item">Results</li>
        </ol>
      </div>

      <h1 className="govuk-heading-xl ga-mb-0">Assessment results</h1>
      <p className="govuk-body-l" style={{ marginBottom: 4 }}>
        {meta.organisationName || "Organisation not specified"}
      </p>
      {meta.assessorName && (
        <p className="govuk-body ga-caption" style={{ marginBottom: 2 }}>Assessor: {meta.assessorName}</p>
      )}
      {meta.assessmentDate && (
        <p className="govuk-body ga-caption" style={{ marginBottom: 24 }}>Date: {meta.assessmentDate}</p>
      )}

      {totalNotStarted > 0 && (
        <div className="govuk-warning-text" style={{ marginBottom: 24 }}>
          <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
          <strong className="govuk-warning-text__text">
            <span className="govuk-visually-hidden">Warning</span>
            {totalNotStarted} IGP{totalNotStarted !== 1 ? "s" : ""} have not been assessed yet. Return to the{" "}
            <Link href="/assessment" className="govuk-link">assessment overview</Link> to complete them.
          </strong>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 32 }}>
        {[
          { label: "Achieved", count: totalAchieved, colour: "#00703c", bg: "#cce2d8" },
          { label: "Partially achieved", count: totalPartial, colour: "#f47738", bg: "#fde4d1" },
          { label: "Not achieved", count: totalNotAchieved, colour: "#d4351c", bg: "#f6d7d2" },
          { label: "Not started", count: totalNotStarted, colour: "#505a5f", bg: "#f3f2f1" },
        ].map((item) => (
          <div key={item.label} style={{ background: item.bg, borderRadius: 4, padding: "20px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: item.colour }}>{item.count}</div>
            <div style={{ fontSize: 13, color: item.colour, marginTop: 4 }}>{item.label}</div>
          </div>
        ))}
      </div>

      <h2 className="govuk-heading-m">Completion</h2>
      <div className="ga-progress" style={{ marginBottom: 8 }}>
        <div className="ga-progress__fill" style={{ width: `${pct}%`, background: "#1d70b8" }} />
      </div>
      <p className="govuk-body" style={{ marginBottom: 32 }}>
        {completed} of {TOTAL_IGPS} IGPs assessed ({pct}% complete)
      </p>

      <div className="ga-no-print" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 40 }}>
        <button className="govuk-button govuk-button--secondary" onClick={handleWordExport}>
          Export to Word
        </button>
        <button className="govuk-button govuk-button--secondary" onClick={handlePrint}>
          Print / Save as PDF
        </button>
        <button className="govuk-button govuk-button--secondary" onClick={handleExport}>
          {exported ? "Saved!" : "Export JSON"}
        </button>
      </div>

      {CAF.map((objective) => (
        <div key={objective.id} className="ga-results-obj">
          <div className="ga-results-obj__header" style={{ borderColor: objective.colour, color: objective.colour }}>
            Objective {objective.id}: {objective.title}
          </div>
          <table className="govuk-table">
            <thead className="govuk-table__head">
              <tr className="govuk-table__row">
                <th className="govuk-table__header">Principle</th>
                <th className="govuk-table__header govuk-table__header--numeric" style={{ color: "#00703c" }}>Achieved</th>
                <th className="govuk-table__header govuk-table__header--numeric" style={{ color: "#f47738" }}>Partial</th>
                <th className="govuk-table__header govuk-table__header--numeric" style={{ color: "#d4351c" }}>Not achieved</th>
                <th className="govuk-table__header govuk-table__header--numeric">Not started</th>
                <th className="govuk-table__header govuk-table__header--numeric">Total</th>
              </tr>
            </thead>
            <tbody className="govuk-table__body">
              {objective.principles.map((p) => (
                <PrincipleResultRow key={p.id} principle={p} responses={responses} objectiveColour={objective.colour} />
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <div style={{ marginBottom: 32 }}>
        <button className="govuk-button govuk-button--secondary ga-no-print" onClick={() => setShowDetail(!showDetail)}>
          {showDetail ? "Hide" : "Show"} detailed IGP breakdown
        </button>
      </div>

      {showDetail && (
        <div>
          {CAF.map((objective) => (
            <div key={objective.id} className="ga-results-obj">
              <div className="ga-results-obj__header" style={{ borderColor: objective.colour, color: objective.colour }}>
                Objective {objective.id}: {objective.title}
              </div>
              {objective.principles.map((p) => (
                <div key={p.id} style={{ marginBottom: 24 }}>
                  <h3 className="govuk-heading-m" style={{ borderLeft: `4px solid ${objective.colour}`, paddingLeft: 10 }}>
                    {p.id} – {p.title}
                  </h3>
                  <IgpDetailTable igps={p.igps} responses={responses} />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <div className="govuk-inset-text" style={{ marginTop: 40 }}>
        <p className="govuk-body" style={{ marginBottom: 0 }}>
          This self-assessment is indicative only. It is not an official NCSC assessment and does not constitute
          certification or regulatory compliance. Consult NCSC guidance and qualified assessors for formal CAF
          assessments.
        </p>
      </div>
    </Layout>
  );
}
