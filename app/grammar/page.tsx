"use client";

import { useState, useCallback } from "react";

interface Exercise {
  id: number;
  topic: string;
  sentence: string;
  blanks: string[];
  hint: string;
  explanation: string;
}

const exercises: Exercise[] = [
  {
    id: 1,
    topic: "Present Perfect",
    sentence: "I ___ never ___ sushi before.",
    blanks: ["have", "eaten"],
    hint: "Use 'have/has + past participle' for experiences",
    explanation: "Present perfect is used for life experiences without specifying time. 'Have + past participle' is the structure.",
  },
  {
    id: 2,
    topic: "Conditional (If...)",
    sentence: "If it ___, we ___ stay home.",
    blanks: ["rains", "will"],
    hint: "First conditional: if + present simple, will + base verb",
    explanation: "First conditional describes a real possibility in the future. Structure: If + present simple, will + base form.",
  },
  {
    id: 3,
    topic: "Passive Voice",
    sentence: "The report ___ ___ by the manager yesterday.",
    blanks: ["was", "written"],
    hint: "Passive: was/were + past participle",
    explanation: "Passive voice focuses on what happened, not who did it. Structure: was/were + past participle.",
  },
  {
    id: 4,
    topic: "Articles (a/an/the)",
    sentence: "___ sun sets in ___ west.",
    blanks: ["The", "the"],
    hint: "Use 'the' for unique things and specific directions",
    explanation: "'The' is used for unique things (the sun) and for specific nouns (directions like the west/east).",
  },
  {
    id: 5,
    topic: "Comparative & Superlative",
    sentence: "This is ___ expensive restaurant in the city.",
    blanks: ["the most"],
    hint: "Superlative for multi-syllable adjectives: the most + adjective",
    explanation: "For adjectives with 3+ syllables, use 'the most' for superlative. 'Expensive' → 'the most expensive'.",
  },
  {
    id: 6,
    topic: "Modal Verbs",
    sentence: "You ___ wear a seatbelt. It's the law.",
    blanks: ["must"],
    hint: "Use 'must' for strong obligation or necessity",
    explanation: "'Must' expresses strong obligation or necessity, especially rules and laws.",
  },
  {
    id: 7,
    topic: "Prepositions of Time",
    sentence: "The meeting is ___ Monday ___ 3 PM.",
    blanks: ["on", "at"],
    hint: "Days use 'on'; specific times use 'at'",
    explanation: "Use 'on' for days (on Monday, on Friday). Use 'at' for specific times (at 3 PM, at noon).",
  },
  {
    id: 8,
    topic: "Reported Speech",
    sentence: 'She said she ___ tired and ___ leave early.',
    blanks: ["was", "would"],
    hint: "Reported speech: present → past, will → would",
    explanation: "In reported speech, verbs shift back in time. 'is' → 'was', 'will' → 'would'.",
  },
];

interface FeedbackState {
  correct: boolean;
  feedback: string;
  explanation: string;
  tip: string;
}

export default function GrammarPage() {
  const [currentEx, setCurrentEx] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [loading, setLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const exercise = exercises[currentEx];

  const handleAnswer = (idx: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[idx] = value;
    setAnswers(newAnswers);
  };

  const checkAnswer = useCallback(async () => {
    if (answers.some((a) => !a || !a.trim())) {
      alert("Please fill in all blanks.");
      return;
    }

    setLoading(true);
    setSubmitted(true);

    const userAnswer = answers.join(" / ");
    const correctAnswer = exercise.blanks.join(" / ");

    try {
      const res = await fetch("/api/grammar-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sentence: exercise.sentence,
          userAnswer,
          correctAnswer,
          topic: exercise.topic,
        }),
      });
      const data = await res.json();
      setFeedback(data);

      const isCorrect = answers.every(
        (a, i) => a.trim().toLowerCase() === exercise.blanks[i].toLowerCase()
      );
      if (isCorrect) {
        setScore((s) => ({ correct: s.correct + 1, total: s.total + 1 }));
      } else {
        setScore((s) => ({ ...s, total: s.total + 1 }));
      }

      // Save progress
      const saved = localStorage.getItem("tangmogolearn_progress");
      const p = saved ? JSON.parse(saved) : {};
      p.grammarCompleted = (p.grammarCompleted || 0) + 1;
      p.lastActiveDate = new Date().toDateString();
      localStorage.setItem("tangmogolearn_progress", JSON.stringify(p));
    } catch {
      setFeedback({
        correct: false,
        feedback: "Could not connect to AI. Check your answer manually.",
        explanation: exercise.explanation,
        tip: exercise.hint,
      });
    } finally {
      setLoading(false);
    }
  }, [answers, exercise]);

  const nextExercise = () => {
    setCurrentEx((i) => (i + 1) % exercises.length);
    setAnswers([]);
    setSubmitted(false);
    setFeedback(null);
    setShowHint(false);
  };

  const isCorrectAnswer = (idx: number) =>
    answers[idx]?.trim().toLowerCase() === exercise.blanks[idx].toLowerCase();

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">✏️ Grammar Practice</h1>
        <p className="text-slate-600">Fill in the blanks to practice English grammar patterns.</p>
      </div>

      {/* Score */}
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm">
          <span className="text-slate-500">Score: </span>
          <span className="font-bold text-purple-600">{score.correct}/{score.total}</span>
        </div>
        <div className="flex-1 bg-slate-200 rounded-full h-2">
          <div
            className="bg-purple-500 h-2 rounded-full transition-all"
            style={{ width: `${((currentEx + 1) / exercises.length) * 100}%` }}
          />
        </div>
        <span className="text-sm text-slate-500">{currentEx + 1}/{exercises.length}</span>
      </div>

      {/* Exercise Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        {/* Topic badge */}
        <div className="flex items-center gap-3 mb-6">
          <span className="bg-purple-100 text-purple-700 text-sm font-medium px-3 py-1 rounded-full">
            {exercise.topic}
          </span>
          <button
            onClick={() => setShowHint(!showHint)}
            className="text-sm text-amber-600 hover:text-amber-700 font-medium"
          >
            {showHint ? "Hide hint" : "💡 Show hint"}
          </button>
        </div>

        {showHint && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6 text-sm text-amber-800">
            💡 {exercise.hint}
          </div>
        )}

        {/* Sentence with blanks */}
        <div className="text-xl text-slate-800 leading-relaxed mb-8">
          {exercise.sentence.split("___").map((part, i) => (
            <span key={i}>
              {part}
              {i < exercise.blanks.length && (
                <input
                  type="text"
                  value={answers[i] || ""}
                  onChange={(e) => handleAnswer(i, e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !submitted && checkAnswer()}
                  disabled={submitted}
                  placeholder="..."
                  className={`inline-block mx-1 px-2 py-0.5 border-b-2 bg-transparent text-center font-medium text-base w-24 focus:outline-none transition-colors ${
                    submitted
                      ? isCorrectAnswer(i)
                        ? "border-emerald-500 text-emerald-700"
                        : "border-red-400 text-red-600"
                      : "border-purple-400 focus:border-purple-600 text-slate-900"
                  }`}
                />
              )}
            </span>
          ))}
        </div>

        {/* Submit / Next */}
        {!submitted ? (
          <button
            onClick={checkAnswer}
            disabled={loading || answers.filter(Boolean).length < exercise.blanks.length}
            className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Checking..." : "Check Answer →"}
          </button>
        ) : (
          <button
            onClick={nextExercise}
            className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
          >
            Next Exercise →
          </button>
        )}
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`mt-4 border rounded-2xl p-6 ${
            feedback.correct
              ? "bg-emerald-50 border-emerald-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">{feedback.correct ? "✅" : "❌"}</span>
            <p className="font-medium text-slate-900">{feedback.feedback}</p>
          </div>
          <p className="text-sm text-slate-700 mb-2">
            <strong>Explanation:</strong> {feedback.explanation}
          </p>
          {feedback.tip && (
            <p className="text-sm text-slate-600">
              <strong>Tip:</strong> {feedback.tip}
            </p>
          )}
          {!feedback.correct && (
            <div className="mt-3 pt-3 border-t border-slate-200">
              <p className="text-sm text-slate-600">
                <strong>Correct answer:</strong>{" "}
                <span className="text-emerald-700 font-medium">{exercise.blanks.join(", ")}</span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Exercise list navigation */}
      <div className="mt-8 flex flex-wrap gap-2">
        {exercises.map((ex, i) => (
          <button
            key={i}
            onClick={() => {
              setCurrentEx(i);
              setAnswers([]);
              setSubmitted(false);
              setFeedback(null);
              setShowHint(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              i === currentEx
                ? "bg-purple-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {ex.topic}
          </button>
        ))}
      </div>
    </div>
  );
}
