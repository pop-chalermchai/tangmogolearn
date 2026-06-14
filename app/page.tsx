"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Progress {
  vocabularyLearned: number;
  grammarCompleted: number;
  dialoguesCompleted: number;
  speakingSessionsDone: number;
  streak: number;
  lastActiveDate: string;
}

const defaultProgress: Progress = {
  vocabularyLearned: 0,
  grammarCompleted: 0,
  dialoguesCompleted: 0,
  speakingSessionsDone: 0,
  streak: 0,
  lastActiveDate: "",
};

const features = [
  {
    href: "/vocabulary",
    emoji: "📚",
    title: "Vocabulary Builder",
    description: "Learn new words with flashcards, example sentences, and spaced repetition. Build a strong vocabulary for everyday conversations.",
    color: "from-blue-500 to-cyan-500",
    bg: "bg-blue-50 hover:bg-blue-100",
    border: "border-blue-200",
    btnColor: "bg-blue-600 hover:bg-blue-700",
    statKey: "vocabularyLearned",
    statLabel: "words learned",
  },
  {
    href: "/grammar",
    emoji: "✏️",
    title: "Grammar Practice",
    description: "Master English grammar rules with interactive exercises. Get AI-powered explanations and instant feedback on your answers.",
    color: "from-purple-500 to-pink-500",
    bg: "bg-purple-50 hover:bg-purple-100",
    border: "border-purple-200",
    btnColor: "bg-purple-600 hover:bg-purple-700",
    statKey: "grammarCompleted",
    statLabel: "exercises done",
  },
  {
    href: "/dialogue",
    emoji: "💬",
    title: "Dialogue Simulator",
    description: "Practice real-life conversations: at a restaurant, airport, job interview, shopping, and more. AI plays the other person!",
    color: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50 hover:bg-emerald-100",
    border: "border-emerald-200",
    btnColor: "bg-emerald-600 hover:bg-emerald-700",
    statKey: "dialoguesCompleted",
    statLabel: "dialogues done",
  },
  {
    href: "/speaking",
    emoji: "🎤",
    title: "Speaking Coach",
    description: "Get personalized speaking tips, pronunciation guidance, and practice scripts. Build confidence to speak English naturally.",
    color: "from-orange-500 to-red-500",
    bg: "bg-orange-50 hover:bg-orange-100",
    border: "border-orange-200",
    btnColor: "bg-orange-600 hover:bg-orange-700",
    statKey: "speakingSessionsDone",
    statLabel: "sessions done",
  },
];

export default function Home() {
  const [progress, setProgress] = useState<Progress>(defaultProgress);

  useEffect(() => {
    const saved = localStorage.getItem("tangmogolearn_progress");
    if (saved) {
      setProgress(JSON.parse(saved));
    }
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="text-6xl mb-4">🍉</div>
        <h1 className="text-5xl font-bold text-slate-900 mb-4">
          Speak English with Confidence
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          AI-powered English learning for everyday life. Build vocabulary, master grammar,
          practice dialogues, and get speaking coaching — all in one place.
        </p>
        {progress.streak > 0 && (
          <div className="mt-6 inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full font-medium">
            🔥 {progress.streak} day streak — keep it up!
          </div>
        )}
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {features.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className={`block ${f.bg} border ${f.border} rounded-2xl p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 group`}
          >
            <div className="flex items-start gap-4">
              <span className="text-4xl">{f.emoji}</span>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-slate-700">
                  {f.title}
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  {f.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500">
                    {(progress[f.statKey as keyof Progress] as number)} {f.statLabel}
                  </span>
                  <span className={`text-xs text-white ${f.btnColor} px-3 py-1.5 rounded-full font-medium transition-colors`}>
                    Start →
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Progress Summary */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Progress</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{progress.vocabularyLearned}</div>
            <div className="text-sm text-slate-500 mt-1">Words Learned</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{progress.grammarCompleted}</div>
            <div className="text-sm text-slate-500 mt-1">Grammar Exercises</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-600">{progress.dialoguesCompleted}</div>
            <div className="text-sm text-slate-500 mt-1">Dialogues Completed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">{progress.speakingSessionsDone}</div>
            <div className="text-sm text-slate-500 mt-1">Speaking Sessions</div>
          </div>
        </div>
      </div>
    </div>
  );
}
