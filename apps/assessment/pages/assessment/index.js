import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "../../components/Layout";
import { loadAssessment } from "../../lib/storage";
import { principleStats } from "../../lib/storage";
import { CAF, TOTAL_IGPS, SCORES } from "../../data/caf";

function ScoreBar({ stats }) {
  const { total, achieved, partial, notAchieved, notStarted } = stats;
  if (total === 0) return null;

  const pctA = (achieved / total) * 100;
  const pctP = (partial / total) * 100;
  const pctN = (notAchieved / total) * 100;
  const pctS = (notStarted / total) * 100;

  return (
    <div style={{ display: "flex", height: 10, borderRadius: 5, overflow: "hidden", gap: 1 }}>
      {pctA > 0 && <div style={{ flex: pctA, background: "#00703c" }} title={`Achieved: ${achieved}`} />}
      {pctP > 0 && <div style={{ flex: pctP, background: "#f47738" }} title={`Partially achieved: ${partial}`} />}
      {pctN > 0 && <div style={{ flex: pctN, background: "#d4351c" }} title={`Not achieved: ${notAchieved}`} />}
      {pctS > 0 && <div style={{ flex: pctS, background: "#b1b4b6" }} title={`Not started: ${notStarted}`} />}
    </div>
  );
}

function StatusTag({ stats }) {
  if (stats.notStarted === stats.total) {
    return <strong className="govuk-tag govuk-tag--grey">Not started</strong>;
  }
  if (stats.notStarted === 0) {
    if (stats.notAchieved === 0 && stats.partial === 0) {
      return <strong className="govuk-tag" style={{ background: "#00703c" }}>All achieved</strong>;
    }
    return <strong className="govuk-tag" style={{ background: "#005ea5" }}>Complete</strong>;
  }
  return <strong className="govuk-tag govuk-tag--blue">In progress</strong>;
}

export default function AssessmentOverview() {
  const router = useRouter();
  const [assessment, setAssessment] = useState(null);

  useEffect(() => {
    const saved = loadAssessment();
    if (!saved) {
      router.push("/");
      return;
    }
    setAssessment(saved);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!assessment) return null;

  const { meta, responses } = assessment;
  const respondedCount = Object.values(responses).filter((r) => r?.score).length;
  const overallPct = Math.round((respondedCount / TOTAL_IGPS) * 100);

  return (
    <Layout title="Assessment overview">
      {/* Breadcrumb */}
      <div className="govuk-breadcrumbs" style={{ marginBottom: 24 }}>
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item">
            <Link href="/" className="govuk-breadcrumbs__link">Home</Link>
          </li>
          <li className="govuk-breadcrumbs__list-item">Assessment overview</li>
        </ol>
      </div>

      {/* Heading */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
        <div>
          <h1 className="govuk-heading-xl ga-mt-0 ga-mb-0">{meta.organisationName || "Assessment"}</h1>
          {meta.assessorName && <p className="govuk-body ga-caption">Assessor: {meta.assessorName}</p>}
          {meta.assessmentDate && <p className="govuk-body ga-caption">Date: {meta.assessmentDate}</p>}
        </div>
        <Link href="/results" className="govuk-button govuk-button--secondary" style={{ marginBottom: 0 }}>
          View results
        </Link>
      </div>

      {/* Overall progress */}
      <div className="govuk-inset-text" style={{ marginBottom: 32 }}>
        <p className="govuk-body" style={{ marginBottom: 8 }}>
          <strong>{respondedCount}</strong> of <strong>{TOTAL_IGPS}</strong> IGPs assessed &mdash;{" "}
          <strong>{overallPct}%</strong> complete
        </p>
        <div className="ga-progress">
          <div
            className="ga-progress__fill"
            style={{
              width: `${overallPct}%`,
              background: overallPct === 100 ? "#00703c" : "#1d70b8",
            }}
          />
        </div>
      </div>

      {/* Objectives and Principles */}
      {CAF.map((objective) => {
        // Aggregate all IGPs across this objective
        let objAchieved = 0, objPartial = 0, objNot = 0, objNotStarted = 0;

        return (
          <div key={objective.id} style={{ marginBottom: 40 }}>
            {/* Objective header */}
            <div
              style={{
                borderLeft: `6px solid ${objective.colour}`,
                paddingLeft: 16,
                marginBottom: 16,
              }}
            >
              <p className="govuk-caption-m" style={{ marginBottom: 0 }}>
                Objective {objective.id}
              </p>
              <h2 className="govuk-heading-l" style={{ marginBottom: 4 }}>
                {objective.title}
              </h2>
            </div>

            {/* Principles */}
            {objective.principles.map((principle) => {
              const stats = principleStats(principle, responses);

              return (
                <Link
                  key={principle.id}
                  href={`/assessment/${principle.id.toLowerCase()}`}
                  className="ga-principle-row"
                  style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 16, alignItems: "center" }}
                >
                  {/* ID badge */}
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      background: objective.colour,
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 15,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 4,
                      flexShrink: 0,
                    }}
                  >
                    {principle.id}
                  </div>

                  {/* Title + bar */}
                  <div>
                    <p className="govuk-body ga-fw-bold ga-mb-0">{principle.title}</p>
                    <p className="govuk-body-s ga-caption ga-mb-0" style={{ marginBottom: 6 }}>
                      {stats.total} IGP{stats.total !== 1 ? "s" : ""} &mdash;{" "}
                      {stats.achieved} achieved
                      {stats.partial > 0 ? `, ${stats.partial} partial` : ""}
                      {stats.notAchieved > 0 ? `, ${stats.notAchieved} not achieved` : ""}
                      {stats.notStarted > 0 ? `, ${stats.notStarted} not started` : ""}
                    </p>
                    <ScoreBar stats={stats} />
                  </div>

                  {/* Status tag */}
                  <div style={{ textAlign: "right" }}>
                    <StatusTag stats={stats} />
                    <p className="govuk-body-s ga-caption" style={{ marginTop: 4, marginBottom: 0 }}>
                      {stats.total - stats.notStarted}/{stats.total}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        );
      })}

      {/* Bottom actions */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 32 }}>
        <Link href="/results" className="govuk-button">
          View results &amp; export
        </Link>
        <Link href="/" className="govuk-button govuk-button--secondary">
          Back to home
        </Link>
      </div>
    </Layout>
  );
}
