/**
 * Govassure – localStorage persistence helpers
 *
 * Assessment state shape:
 * {
 *   meta: { organisationName, assessorName, assessmentDate, createdAt, updatedAt },
 *   responses: {
 *     "A1a": { score: "achieved" | "partially_achieved" | "not_achieved" | null, notes: "" },
 *     ...
 *   }
 * }
 */

const STORAGE_KEY = "govassure_caf_assessment";

export function loadAssessment() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveAssessment(state) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage quota exceeded or private browsing
  }
}

export function clearAssessment() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function createEmptyAssessment(meta = {}) {
  return {
    meta: {
      organisationName: "",
      assessorName: "",
      assessmentDate: new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...meta,
    },
    responses: {},
  };
}

/** Merge an imported assessment with a fresh empty one to fill gaps */
export function mergeAssessment(imported) {
  const base = createEmptyAssessment(imported.meta || {});
  return {
    ...base,
    meta: { ...base.meta, ...(imported.meta || {}), updatedAt: new Date().toISOString() },
    responses: imported.responses || {},
  };
}

/** Count how many IGPs have a non-null score */
export function countResponded(responses) {
  return Object.values(responses).filter((r) => r && r.score).length;
}

/** Compute principle-level stats */
export function principleStats(principle, responses) {
  let achieved = 0,
    partial = 0,
    notAchieved = 0,
    notStarted = 0;

  for (const igp of principle.igps) {
    const r = responses[igp.id];
    if (!r || !r.score) notStarted++;
    else if (r.score === "achieved") achieved++;
    else if (r.score === "partially_achieved") partial++;
    else notAchieved++;
  }

  return {
    total: principle.igps.length,
    achieved,
    partial,
    notAchieved,
    notStarted,
    complete: notStarted === 0,
  };
}
