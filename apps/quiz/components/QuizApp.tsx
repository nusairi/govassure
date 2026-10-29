"use client";

import { useState, useEffect } from "react";
import {
  questions,
  MODULE_NAMES,
  getQuestionsByModule,
  getAllQuestions,
  shuffleArray,
  type Question,
} from "@/data/questions";

// ─── Types ────────────────────────────────────────────────────────────────────

type QuizMode = "home" | "setup" | "quiz" | "review";

interface QuizConfig {
  mode: "practice" | "exam";
  moduleId: number | null; // null = all modules
  shuffle: boolean;
  showExplanations: boolean;
  timed: boolean;
}

interface UserAnswer {
  questionId: string;
  selected: string;
  correct: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const EXAM_DURATION_MINUTES = 120;
const PASSING_SCORE_PCT = 80;
const FULL_EXAM_QUESTION_LIMIT = 60;

const THEMES = [
  { id: "default", name: "Ocean", swatch: "#2563eb" },
  { id: "midnight", name: "Midnight", swatch: "#7c3aed" },
  { id: "forest", name: "Forest", swatch: "#059669" },
  { id: "rose", name: "Rose", swatch: "#e11d48" },
  { id: "slate", name: "Slate", swatch: "#475569" },
] as const;

type ThemeId = (typeof THEMES)[number]["id"];
const THEME_STORAGE_KEY = "ai-safety-quiz-theme";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function scoreColor(pct: number): string {
  if (pct >= PASSING_SCORE_PCT) return "text-green-600";
  if (pct >= 60) return "text-amber-600";
  return "text-red-600";
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>Question {current} of {total}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Timer({
  secondsLeft,
  total,
}: {
  secondsLeft: number;
  total: number;
}) {
  const pct = (secondsLeft / total) * 100;
  const urgent = secondsLeft < 300; // < 5 minutes
  return (
    <div
      className={`flex items-center gap-2 font-mono text-sm font-semibold px-3 py-1.5 rounded-lg border ${
        urgent
          ? "border-red-300 bg-red-50 text-red-600"
          : "border-slate-200 bg-slate-50 text-slate-700"
      }`}
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="10" strokeWidth="2" />
        <path strokeWidth="2" strokeLinecap="round" d="M12 6v6l4 2" />
      </svg>
      {formatTime(secondsLeft)}
      {urgent && (
        <span className="text-xs font-normal animate-pulse">Low time!</span>
      )}
    </div>
  );
}

// ─── Theme Switcher ──────────────────────────────────────────────────────────

function ThemeSwitcher() {
  const [theme, setTheme] = useState<ThemeId>("default");
  const [open, setOpen] = useState(false);

  // Load saved theme on mount
  useEffect(() => {
    const saved = (typeof window !== "undefined" &&
      window.localStorage.getItem(THEME_STORAGE_KEY)) as ThemeId | null;
    if (saved && THEMES.some((t) => t.id === saved)) {
      setTheme(saved);
      document.documentElement.dataset.theme = saved;
    } else {
      document.documentElement.dataset.theme = "default";
    }
  }, []);

  function applyTheme(id: ThemeId) {
    setTheme(id);
    setOpen(false);
    document.documentElement.dataset.theme = id;
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, id);
    } catch {
      /* ignore storage errors */
    }
  }

  const active = THEMES.find((t) => t.id === theme) ?? THEMES[0];

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Change theme"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-slate-300/60 bg-white/90 backdrop-blur px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-white transition-colors"
      >
        <span
          className="w-3.5 h-3.5 rounded-full border border-black/10"
          style={{ backgroundColor: active.swatch }}
        />
        <span className="hidden sm:inline">{active.name}</span>
        <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => applyTheme(t.id)}
              className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-slate-50 ${
                t.id === theme ? "font-semibold text-slate-900" : "text-slate-600"
              }`}
            >
              <span
                className="w-3.5 h-3.5 rounded-full border border-black/10 flex-shrink-0"
                style={{ backgroundColor: t.swatch }}
              />
              {t.name}
              {t.id === theme && <span className="ml-auto text-xs">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Home Screen ─────────────────────────────────────────────────────────────

function HomeScreen({ onStart }: { onStart: () => void }) {
  const moduleCount = Object.keys(MODULE_NAMES).length;
  const questionCount = questions.length;

  return (
    <div className="home-hero min-h-screen flex flex-col">
      {/* Header */}
      <header className="pt-12 pb-8 px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold px-3 py-1 rounded-full mb-6">
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
          Open Source · Free Practice
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
          AI Safety Practice Quiz
        </h1>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Sharpen your knowledge of AI safety, security, governance, and ethics.
          Covers generative AI architecture, threat taxonomy, compliance
          frameworks, data privacy, and more.
        </p>
      </header>

      {/* Stats */}
      <div className="flex justify-center gap-6 px-4 mb-10">
        {[
          { label: "Modules", value: moduleCount },
          { label: "Questions", value: FULL_EXAM_QUESTION_LIMIT },
          { label: "Passing Score", value: `${PASSING_SCORE_PCT}%` },
        ].map((s) => (
          <div
            key={s.label}
            className="text-center bg-white/5 border border-white/10 rounded-xl px-6 py-4"
          >
            <div className="text-3xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Module grid */}
      <div className="max-w-4xl mx-auto w-full px-4 mb-10">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4 text-center">
          Curriculum Modules
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(MODULE_NAMES).map(([num, name]) => (
            <div
              key={num}
              className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-3"
            >
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600/30 text-blue-300 text-xs font-bold flex items-center justify-center mt-0.5">
                {num}
              </span>
              <span className="text-slate-300 text-sm leading-snug">{name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="flex justify-center pb-10 px-4">
        <button
          onClick={onStart}
          className="btn-primary text-lg px-10 py-4 shadow-lg shadow-black/30"
        >
          Start Practicing →
        </button>
      </div>

      {/* Footer */}
      <footer className="mt-auto pb-8 px-4 text-center">
        <a
          href="https://www.linkedin.com/company/102617034/"
          target="_blank"
          rel="noopener"
          aria-label="GOV Assured on LinkedIn"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-blue-300 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
          </svg>
          GOV Assured on LinkedIn
        </a>
      </footer>
    </div>
  );
}

// ─── Setup Screen ─────────────────────────────────────────────────────────────

function SetupScreen({
  onBegin,
  onBack,
}: {
  onBegin: (config: QuizConfig) => void;
  onBack: () => void;
}) {
  const [mode, setMode] = useState<"practice" | "exam">("practice");
  const [moduleId, setModuleId] = useState<number | null>(null);
  const [shuffle, setShuffle] = useState(true);
  const [showExplanations, setShowExplanations] = useState(true);
  const [timed, setTimed] = useState(false);

  const questionCount =
    moduleId === null
      ? FULL_EXAM_QUESTION_LIMIT
      : getQuestionsByModule(moduleId).length;

  function handleBegin() {
    onBegin({
      mode,
      moduleId,
      shuffle,
      showExplanations: mode === "exam" ? false : showExplanations,
      timed: mode === "exam" ? true : timed,
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-start py-12 px-4">
      <div className="w-full max-w-lg">
        <button
          onClick={onBack}
          className="text-slate-500 hover:text-slate-800 text-sm mb-6 flex items-center gap-1"
        >
          ← Back
        </button>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Quiz Setup</h2>
        <p className="text-slate-500 mb-8 text-sm">
          Configure your practice session.
        </p>

        {/* Mode */}
        <div className="card mb-4">
          <h3 className="font-semibold text-slate-800 mb-3">Quiz Mode</h3>
          <div className="grid grid-cols-2 gap-3">
            {(["practice", "exam"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-lg border-2 p-4 text-left transition-all ${
                  mode === m
                    ? "border-blue-600 bg-blue-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="font-semibold text-slate-800 capitalize mb-1">
                  {m}
                </div>
                <div className="text-xs text-slate-500">
                  {m === "practice"
                    ? "Self-paced, with optional explanations"
                    : `Timed ${EXAM_DURATION_MINUTES} min, no hints`}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Module select */}
        <div className="card mb-4">
          <h3 className="font-semibold text-slate-800 mb-3">
            Module Selection
          </h3>
          <select
            value={moduleId ?? "all"}
            onChange={(e) =>
              setModuleId(e.target.value === "all" ? null : Number(e.target.value))
            }
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">All Modules ({FULL_EXAM_QUESTION_LIMIT} questions, randomly sampled)</option>
            {Object.entries(MODULE_NAMES).map(([num, name]) => (
              <option key={num} value={num}>
                Module {num}: {name} (
                {getQuestionsByModule(Number(num)).length} questions)
              </option>
            ))}
          </select>
        </div>

        {/* Options */}
        {mode === "practice" && (
          <div className="card mb-4 space-y-4">
            <h3 className="font-semibold text-slate-800">Options</h3>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-slate-700">Shuffle questions</span>
              <div
                onClick={() => setShuffle(!shuffle)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  shuffle ? "bg-blue-600" : "bg-slate-300"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    shuffle ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </div>
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-slate-700">
                Show explanations after each answer
              </span>
              <div
                onClick={() => setShowExplanations(!showExplanations)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  showExplanations ? "bg-blue-600" : "bg-slate-300"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    showExplanations ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </div>
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-slate-700">
                Timed ({EXAM_DURATION_MINUTES} min)
              </span>
              <div
                onClick={() => setTimed(!timed)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  timed ? "bg-blue-600" : "bg-slate-300"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    timed ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </div>
            </label>
          </div>
        )}

        {mode === "exam" && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4 text-sm text-amber-800">
            <strong>Exam Simulation:</strong> {EXAM_DURATION_MINUTES} minutes ·{" "}
            {questionCount} questions · No explanations until the end · Passing
            score {PASSING_SCORE_PCT}%
          </div>
        )}

        <button onClick={handleBegin} className="btn-primary w-full text-base">
          Begin Quiz ({questionCount} questions) →
        </button>
      </div>
    </div>
  );
}

// ─── Question Screen ──────────────────────────────────────────────────────────

function QuizScreen({
  quiz,
  config,
  onFinish,
}: {
  quiz: Question[];
  config: QuizConfig;
  onFinish: (answers: UserAnswer[]) => void;
}) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(
    config.timed ? EXAM_DURATION_MINUTES * 60 : -1
  );
  const totalSeconds = EXAM_DURATION_MINUTES * 60;

  const question = quiz[current];

  // Timer
  useEffect(() => {
    if (!config.timed || secondsLeft <= 0) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          // Auto-submit remaining
          onFinish([
            ...answers,
            ...quiz.slice(current).map((q) => ({
              questionId: q.id,
              selected: "",
              correct: false,
            })),
          ]);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [config.timed, current]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSelect(letter: string) {
    if (confirmed) return;
    setSelected(letter);
  }

  function handleConfirm() {
    if (!selected) return;
    const correct = selected === question.correctAnswer;
    const newAnswer: UserAnswer = {
      questionId: question.id,
      selected,
      correct,
    };
    const newAnswers = [...answers, newAnswer];

    if (config.showExplanations) {
      setConfirmed(true);
      setAnswers(newAnswers);
    } else {
      advanceOrFinish(newAnswers);
    }
  }

  function advanceOrFinish(newAnswers: UserAnswer[]) {
    if (current + 1 < quiz.length) {
      setCurrent((c) => c + 1);
      setSelected(null);
      setConfirmed(false);
    } else {
      onFinish(newAnswers);
    }
  }

  function handleNext() {
    advanceOrFinish(answers);
  }

  function handleSkip() {
    const newAnswers = [
      ...answers,
      { questionId: question.id, selected: "", correct: false },
    ];
    advanceOrFinish(newAnswers);
  }

  const optionStyle = (letter: string): string => {
    const base =
      "w-full text-left px-4 py-3.5 rounded-lg border-2 text-sm font-medium transition-all duration-100 ";
    if (!confirmed) {
      if (selected === letter)
        return base + "border-blue-600 bg-blue-50 text-blue-900";
      return base + "border-slate-200 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50";
    }
    if (letter === question.correctAnswer)
      return base + "border-green-500 bg-green-50 text-green-900";
    if (letter === selected && letter !== question.correctAnswer)
      return base + "border-red-400 bg-red-50 text-red-900";
    return base + "border-slate-200 bg-white text-slate-400";
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <div className="flex-1">
            <ProgressBar current={current + 1} total={quiz.length} />
          </div>
          {config.timed && secondsLeft >= 0 && (
            <Timer secondsLeft={secondsLeft} total={totalSeconds} />
          )}
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        {/* Module badge */}
        <div className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">
          Module {question.module}: {question.moduleName}
        </div>

        {/* Question text */}
        <h2 className="text-lg font-semibold text-slate-900 mb-6 leading-snug">
          {question.text}
        </h2>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {question.options.map((opt) => (
            <button
              key={opt.letter}
              onClick={() => handleSelect(opt.letter)}
              className={optionStyle(opt.letter)}
              disabled={confirmed}
            >
              <span className="inline-flex items-center gap-3">
                <span
                  className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                    confirmed && opt.letter === question.correctAnswer
                      ? "border-green-500 bg-green-500 text-white"
                      : confirmed && opt.letter === selected && opt.letter !== question.correctAnswer
                      ? "border-red-400 bg-red-400 text-white"
                      : selected === opt.letter && !confirmed
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-current text-current"
                  }`}
                >
                  {opt.letter}
                </span>
                {opt.text}
              </span>
            </button>
          ))}
        </div>

        {/* Explanation (practice mode, after confirming) */}
        {confirmed && config.showExplanations && (
          <div className="mb-6 rounded-xl border border-slate-200 overflow-hidden">
            <div
              className={`px-4 py-2 text-sm font-semibold ${
                selected === question.correctAnswer
                  ? "bg-green-50 text-green-800 border-b border-green-200"
                  : "bg-red-50 text-red-800 border-b border-red-200"
              }`}
            >
              {selected === question.correctAnswer ? "✓ Correct!" : `✗ Incorrect — Answer: ${question.correctAnswer}`}
            </div>
            <div className="p-4 bg-white">
              <p className="text-sm text-slate-700 mb-3 leading-relaxed">
                {question.explanation}
              </p>
              <div className="space-y-1.5">
                {question.options.map((opt) => (
                  <div key={opt.letter} className="text-xs text-slate-600">
                    <span className="font-semibold">{opt.letter}.</span>{" "}
                    {question.justifications[opt.letter]}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          {!confirmed ? (
            <>
              <button
                onClick={handleConfirm}
                disabled={!selected}
                className="btn-primary flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Confirm Answer
              </button>
              <button
                onClick={handleSkip}
                className="btn-secondary px-4"
                title="Skip question"
              >
                Skip
              </button>
            </>
          ) : (
            <button onClick={handleNext} className="btn-primary flex-1">
              {current + 1 < quiz.length ? "Next Question →" : "See Results →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Results Screen ───────────────────────────────────────────────────────────

function ResultsScreen({
  quiz,
  answers,
  config,
  onRestart,
  onHome,
}: {
  quiz: Question[];
  answers: UserAnswer[];
  config: QuizConfig;
  onRestart: () => void;
  onHome: () => void;
}) {
  const [showReview, setShowReview] = useState(false);
  const [filterModule, setFilterModule] = useState<number | null>(null);

  const correct = answers.filter((a) => a.correct).length;
  const total = answers.length;
  const pct = Math.round((correct / total) * 100);
  const passed = pct >= PASSING_SCORE_PCT;

  // Per-module breakdown
  const moduleScores: Record<number, { correct: number; total: number }> = {};
  quiz.forEach((q, i) => {
    if (!moduleScores[q.module]) moduleScores[q.module] = { correct: 0, total: 0 };
    moduleScores[q.module].total++;
    if (answers[i]?.correct) moduleScores[q.module].correct++;
  });

  const reviewItems = quiz
    .map((q, i) => ({ q, a: answers[i] }))
    .filter(({ q }) => filterModule === null || q.module === filterModule);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Score card */}
        <div className={`rounded-2xl p-8 text-center mb-8 border ${passed ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
          <div className={`text-6xl font-bold mb-2 ${scoreColor(pct)}`}>
            {pct}%
          </div>
          <div className={`text-lg font-semibold mb-1 ${passed ? "text-green-800" : "text-red-800"}`}>
            {passed ? "🎉 Passed!" : "Not Passed"}
          </div>
          <div className="text-sm text-slate-600">
            {correct} / {total} correct · Passing score: {PASSING_SCORE_PCT}%
          </div>
        </div>

        {/* Module breakdown */}
        <div className="card mb-6">
          <h3 className="font-semibold text-slate-800 mb-4">Module Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(moduleScores).map(([mod, score]) => {
              const modPct = Math.round((score.correct / score.total) * 100);
              return (
                <div key={mod}>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span className="truncate pr-2">{MODULE_NAMES[Number(mod)]}</span>
                    <span className={`font-semibold flex-shrink-0 ${scoreColor(modPct)}`}>
                      {score.correct}/{score.total}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full">
                    <div
                      className={`h-full rounded-full ${modPct >= 80 ? "bg-green-500" : modPct >= 60 ? "bg-amber-400" : "bg-red-400"}`}
                      style={{ width: `${modPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-8">
          <button onClick={onRestart} className="btn-primary flex-1">
            Try Again
          </button>
          <button onClick={onHome} className="btn-secondary flex-1">
            Home
          </button>
        </div>

        {/* Review toggle */}
        <button
          onClick={() => setShowReview(!showReview)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors mb-4"
        >
          <span>Review Answers &amp; Explanations</span>
          <span>{showReview ? "▲" : "▼"}</span>
        </button>

        {showReview && (
          <div>
            {/* Filter by module */}
            <select
              value={filterModule ?? "all"}
              onChange={(e) =>
                setFilterModule(e.target.value === "all" ? null : Number(e.target.value))
              }
              className="w-full mb-4 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Modules</option>
              {Object.entries(MODULE_NAMES).map(([num, name]) =>
                moduleScores[Number(num)] ? (
                  <option key={num} value={num}>
                    Module {num}: {name}
                  </option>
                ) : null
              )}
            </select>

            <div className="space-y-4">
              {reviewItems.map(({ q, a }, idx) => {
                const isCorrect = a?.correct;
                const userSelected = a?.selected || "–";
                return (
                  <div
                    key={q.id}
                    className={`rounded-xl border overflow-hidden ${isCorrect ? "border-green-200" : "border-red-200"}`}
                  >
                    <div
                      className={`px-4 py-2 flex items-start justify-between gap-2 text-xs font-semibold ${
                        isCorrect
                          ? "bg-green-50 text-green-800"
                          : "bg-red-50 text-red-800"
                      }`}
                    >
                      <span>
                        {isCorrect ? "✓ Correct" : "✗ Incorrect"} · Module{" "}
                        {q.module}
                      </span>
                      <span className="text-right opacity-70">{q.id}</span>
                    </div>
                    <div className="p-4 bg-white">
                      <p className="text-sm font-medium text-slate-800 mb-3">
                        {q.text}
                      </p>
                      {q.options.map((opt) => {
                        let style = "text-slate-500";
                        if (opt.letter === q.correctAnswer)
                          style = "text-green-700 font-semibold";
                        else if (opt.letter === userSelected && !isCorrect)
                          style = "text-red-600 line-through";
                        return (
                          <div key={opt.letter} className={`text-xs mb-1 ${style}`}>
                            <span className="font-bold">{opt.letter}.</span>{" "}
                            {opt.text}
                            {opt.letter === q.correctAnswer && " ✓"}
                            {opt.letter === userSelected && !isCorrect && " ✗"}
                          </div>
                        );
                      })}
                      <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 leading-relaxed">
                        <span className="font-semibold">Explanation: </span>
                        {q.explanation}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function QuizApp() {
  const [screen, setScreen] = useState<QuizMode>("home");
  const [config, setConfig] = useState<QuizConfig | null>(null);
  const [quiz, setQuiz] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);

  function handleStart() {
    setScreen("setup");
  }

  function handleBegin(cfg: QuizConfig) {
    const pool =
      cfg.moduleId === null
        ? getAllQuestions()
        : getQuestionsByModule(cfg.moduleId);
    const shuffled = cfg.shuffle ? shuffleArray(pool) : pool;
    const ordered = cfg.moduleId === null
      ? shuffled.slice(0, FULL_EXAM_QUESTION_LIMIT)
      : shuffled;
    setConfig(cfg);
    setQuiz(ordered);
    setAnswers([]);
    setScreen("quiz");
  }

  function handleFinish(ans: UserAnswer[]) {
    setAnswers(ans);
    setScreen("review");
  }

  function handleRestart() {
    if (config) {
      handleBegin(config);
    }
  }

  function handleHome() {
    setScreen("home");
    setConfig(null);
    setQuiz([]);
    setAnswers([]);
  }

  return (
    <>
      <ThemeSwitcher />
      {screen === "home" && <HomeScreen onStart={handleStart} />}
      {screen === "setup" && (
        <SetupScreen onBegin={handleBegin} onBack={handleHome} />
      )}
      {screen === "quiz" && config && (
        <QuizScreen quiz={quiz} config={config} onFinish={handleFinish} />
      )}
      {screen === "review" && config && (
        <ResultsScreen
          quiz={quiz}
          answers={answers}
          config={config}
          onRestart={handleRestart}
          onHome={handleHome}
        />
      )}
    </>
  );
}
