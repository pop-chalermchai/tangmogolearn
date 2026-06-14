"use client";

import { useState, useEffect, useCallback } from "react";

interface WordCard {
  word: string;
  definition: string;
  example: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
}

const wordBank: WordCard[] = [
  // Everyday life - beginner
  { word: "apologize", definition: "to say sorry", example: "I apologize for being late.", category: "Social", difficulty: "beginner" },
  { word: "confirm", definition: "to make sure something is true or will happen", example: "Can you confirm the reservation?", category: "Work", difficulty: "beginner" },
  { word: "schedule", definition: "a plan showing when things will happen", example: "Let me check my schedule.", category: "Work", difficulty: "beginner" },
  { word: "recommend", definition: "to suggest something as a good choice", example: "Can you recommend a good restaurant?", category: "Social", difficulty: "beginner" },
  { word: "available", definition: "free or able to be used", example: "Are you available on Friday?", category: "Work", difficulty: "beginner" },
  { word: "prefer", definition: "to like one thing better than another", example: "I prefer tea over coffee.", category: "Daily", difficulty: "beginner" },
  { word: "mention", definition: "to speak about something briefly", example: "Did you mention the meeting time?", category: "Communication", difficulty: "beginner" },
  { word: "arrange", definition: "to plan or organize something", example: "Can we arrange a meeting?", category: "Work", difficulty: "beginner" },
  // Intermediate
  { word: "negotiate", definition: "to discuss something to reach an agreement", example: "We need to negotiate the price.", category: "Work", difficulty: "intermediate" },
  { word: "anticipate", definition: "to expect or look forward to something", example: "I anticipate some delays.", category: "Communication", difficulty: "intermediate" },
  { word: "clarify", definition: "to make something easier to understand", example: "Could you clarify what you mean?", category: "Communication", difficulty: "intermediate" },
  { word: "emphasize", definition: "to give special importance to something", example: "I want to emphasize this point.", category: "Communication", difficulty: "intermediate" },
  { word: "perspective", definition: "a way of thinking about something", example: "From my perspective, this is fair.", category: "Social", difficulty: "intermediate" },
  { word: "collaborate", definition: "to work together with others", example: "We need to collaborate on this project.", category: "Work", difficulty: "intermediate" },
  { word: "initiative", definition: "the ability to take action without being told", example: "She showed great initiative.", category: "Work", difficulty: "intermediate" },
  { word: "accomplish", definition: "to succeed in doing something", example: "What did you accomplish today?", category: "Daily", difficulty: "intermediate" },
  // Advanced
  { word: "articulate", definition: "able to express ideas clearly", example: "She is very articulate in meetings.", category: "Communication", difficulty: "advanced" },
  { word: "comprehensive", definition: "including all or most parts", example: "We need a comprehensive plan.", category: "Work", difficulty: "advanced" },
  { word: "meticulous", definition: "very careful and paying attention to detail", example: "He is meticulous about his work.", category: "Work", difficulty: "advanced" },
  { word: "substantial", definition: "large in size or importance", example: "There has been substantial progress.", category: "Work", difficulty: "advanced" },
];

const categoryColors: Record<string, string> = {
  Social: "bg-blue-100 text-blue-700",
  Work: "bg-purple-100 text-purple-700",
  Daily: "bg-green-100 text-green-700",
  Communication: "bg-orange-100 text-orange-700",
};

const difficultyColors: Record<string, string> = {
  beginner: "bg-emerald-100 text-emerald-700",
  intermediate: "bg-yellow-100 text-yellow-700",
  advanced: "bg-red-100 text-red-700",
};

export default function VocabularyPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set());
  const [unknown, setUnknown] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState<"all" | "beginner" | "intermediate" | "advanced">("all");
  const [mode, setMode] = useState<"flashcard" | "list">("flashcard");
  const [wordsLearned, setWordsLearned] = useState(0);

  const filteredWords = wordBank.filter(
    (w) => filter === "all" || w.difficulty === filter
  );

  const current = filteredWords[currentIndex] || filteredWords[0];

  useEffect(() => {
    const saved = localStorage.getItem("tangmogolearn_progress");
    if (saved) {
      const p = JSON.parse(saved);
      setWordsLearned(p.vocabularyLearned || 0);
    }
  }, []);

  const saveProgress = useCallback((learned: number) => {
    const saved = localStorage.getItem("tangmogolearn_progress");
    const p = saved ? JSON.parse(saved) : {};
    p.vocabularyLearned = learned;
    p.lastActiveDate = new Date().toDateString();
    localStorage.setItem("tangmogolearn_progress", JSON.stringify(p));
  }, []);

  const handleKnow = () => {
    setKnown((prev) => new Set([...prev, currentIndex]));
    const newLearned = wordsLearned + (known.has(currentIndex) ? 0 : 1);
    setWordsLearned(newLearned);
    saveProgress(newLearned);
    next();
  };

  const handleDontKnow = () => {
    setUnknown((prev) => new Set([...prev, currentIndex]));
    next();
  };

  const next = () => {
    setFlipped(false);
    setTimeout(() => {
      setCurrentIndex((i) => (i + 1) % filteredWords.length);
    }, 150);
  };

  const prev = () => {
    setFlipped(false);
    setTimeout(() => {
      setCurrentIndex((i) => (i - 1 + filteredWords.length) % filteredWords.length);
    }, 150);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">📚 Vocabulary Builder</h1>
        <p className="text-slate-600">Build your English word bank with flashcards and spaced repetition.</p>
      </div>

      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm">
          <span className="text-slate-500">Total Learned: </span>
          <span className="font-bold text-blue-600">{wordsLearned}</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm">
          <span className="text-slate-500">✓ Know: </span>
          <span className="font-bold text-emerald-600">{known.size}</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm">
          <span className="text-slate-500">✗ Review: </span>
          <span className="font-bold text-red-600">{unknown.size}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden">
          {(["all", "beginner", "intermediate", "advanced"] as const).map((d) => (
            <button
              key={d}
              onClick={() => { setFilter(d); setCurrentIndex(0); setFlipped(false); }}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                filter === d
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden">
          {(["flashcard", "list"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                mode === m
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {m === "flashcard" ? "🃏 Flashcard" : "📋 List"}
            </button>
          ))}
        </div>
      </div>

      {mode === "flashcard" ? (
        <div>
          {/* Progress */}
          <div className="mb-4 flex items-center gap-3">
            <div className="flex-1 bg-slate-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${((currentIndex + 1) / filteredWords.length) * 100}%` }}
              />
            </div>
            <span className="text-sm text-slate-500 whitespace-nowrap">
              {currentIndex + 1} / {filteredWords.length}
            </span>
          </div>

          {/* Flashcard */}
          <div
            className="cursor-pointer select-none"
            onClick={() => setFlipped(!flipped)}
          >
            <div
              className={`relative bg-white border-2 rounded-3xl p-10 min-h-64 flex flex-col items-center justify-center text-center transition-all duration-300 shadow-sm hover:shadow-md ${
                known.has(currentIndex)
                  ? "border-emerald-300"
                  : unknown.has(currentIndex)
                  ? "border-red-300"
                  : "border-slate-200"
              }`}
            >
              <div className="flex gap-2 mb-6 flex-wrap justify-center">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${categoryColors[current.category] || "bg-slate-100 text-slate-600"}`}>
                  {current.category}
                </span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${difficultyColors[current.difficulty]}`}>
                  {current.difficulty}
                </span>
              </div>

              {!flipped ? (
                <>
                  <h2 className="text-4xl font-bold text-slate-900 mb-4">{current.word}</h2>
                  <p className="text-slate-400 text-sm">Tap to see definition</p>
                </>
              ) : (
                <>
                  <p className="text-xl text-slate-700 mb-4 font-medium">{current.definition}</p>
                  <p className="text-slate-500 italic text-sm border-t border-slate-100 pt-4 mt-2">
                    &ldquo;{current.example}&rdquo;
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-6 justify-center">
            <button
              onClick={prev}
              className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium"
            >
              ← Prev
            </button>
            <button
              onClick={handleDontKnow}
              className="flex-1 max-w-36 px-4 py-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl hover:bg-red-100 transition-colors text-sm font-medium"
            >
              ✗ Review
            </button>
            <button
              onClick={handleKnow}
              className="flex-1 max-w-36 px-4 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-colors text-sm font-medium"
            >
              ✓ Know it!
            </button>
            <button
              onClick={next}
              className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium"
            >
              Next →
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredWords.map((word, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-bold text-slate-900">{word.word}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColors[word.category] || "bg-slate-100 text-slate-600"}`}>
                    {word.category}
                  </span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${difficultyColors[word.difficulty]}`}>
                    {word.difficulty}
                  </span>
                </div>
                <p className="text-slate-600 text-sm mb-1">{word.definition}</p>
                <p className="text-slate-400 text-xs italic">&ldquo;{word.example}&rdquo;</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
