"use client";

import { useState, useEffect, useCallback } from "react";
import { useSpeech } from "@/app/hooks/useSpeech";
import { wordBank, categories } from "@/app/data/vocabulary";

const categoryColors: Record<string, string> = {
  "Daily Life": "bg-sky-100 text-sky-700",
  Work: "bg-purple-100 text-purple-700",
  Social: "bg-pink-100 text-pink-700",
  Communication: "bg-orange-100 text-orange-700",
  Travel: "bg-cyan-100 text-cyan-700",
  Food: "bg-yellow-100 text-yellow-700",
  Health: "bg-green-100 text-green-700",
  Shopping: "bg-rose-100 text-rose-700",
  Education: "bg-indigo-100 text-indigo-700",
  Technology: "bg-blue-100 text-blue-700",
  Emotions: "bg-fuchsia-100 text-fuchsia-700",
  Home: "bg-amber-100 text-amber-700",
  Nature: "bg-emerald-100 text-emerald-700",
  Money: "bg-lime-100 text-lime-700",
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
  const [levelFilter, setLevelFilter] = useState<"all" | "beginner" | "intermediate" | "advanced">("all");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [mode, setMode] = useState<"flashcard" | "list">("flashcard");
  const [wordsLearned, setWordsLearned] = useState(0);
  const { speak } = useSpeech();

  const filteredWords = wordBank.filter((w) => {
    const levelMatch = levelFilter === "all" || w.difficulty === levelFilter;
    const categoryMatch = categoryFilter === "All" || w.category === categoryFilter;
    return levelMatch && categoryMatch;
  });

  const current = filteredWords[Math.min(currentIndex, filteredWords.length - 1)] || filteredWords[0];

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
    setTimeout(() => setCurrentIndex((i) => (i + 1) % filteredWords.length), 150);
  };

  const prev = () => {
    setFlipped(false);
    setTimeout(() => setCurrentIndex((i) => (i - 1 + filteredWords.length) % filteredWords.length), 150);
  };

  const resetFilters = () => {
    setCurrentIndex(0);
    setFlipped(false);
    setKnown(new Set());
    setUnknown(new Set());
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-1">📚 Vocabulary Builder</h1>
        <p className="text-slate-600 text-sm">
          {wordBank.length.toLocaleString()} words across {categories.length - 1} categories. Build your English word bank!
        </p>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-3 mb-6">
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
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm">
          <span className="text-slate-500">Showing: </span>
          <span className="font-bold text-slate-700">{filteredWords.length} words</span>
        </div>
      </div>

      {/* Level Filter */}
      <div className="flex flex-wrap gap-3 mb-3">
        <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden">
          {(["all", "beginner", "intermediate", "advanced"] as const).map((d) => (
            <button
              key={d}
              onClick={() => { setLevelFilter(d); resetFilters(); }}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                levelFilter === d ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {d === "all" ? "All Levels" : d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden">
          {(["flashcard", "list"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                mode === m ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {m === "flashcard" ? "🃏 Flashcard" : "📋 List"}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => { setCategoryFilter(cat); resetFilters(); }}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              categoryFilter === cat
                ? "bg-slate-900 text-white"
                : `${categoryColors[cat] || "bg-slate-100 text-slate-600"} hover:opacity-80`
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filteredWords.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-4xl mb-2">🔍</p>
          <p>No words match this filter. Try a different combination.</p>
        </div>
      ) : mode === "flashcard" ? (
        <div>
          {/* Progress bar */}
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
          <div className="cursor-pointer select-none" onClick={() => setFlipped(!flipped)}>
            <div
              className={`bg-white border-2 rounded-3xl p-10 min-h-64 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-all ${
                known.has(currentIndex) ? "border-emerald-300" : unknown.has(currentIndex) ? "border-red-300" : "border-slate-200"
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
                  <button
                    onClick={(e) => { e.stopPropagation(); speak(current.word, 0.9); }}
                    className="text-slate-400 hover:text-orange-600 transition-colors mb-2 text-sm"
                  >
                    🔊 Listen
                  </button>
                  <p className="text-slate-400 text-sm">Tap to see definition</p>
                </>
              ) : (
                <>
                  <p className="text-xl text-slate-700 mb-3 font-medium">{current.definition}</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); speak(current.example); }}
                    className="text-slate-400 hover:text-orange-600 transition-colors mb-2 text-sm"
                  >
                    🔊 Example
                  </button>
                  <p className="text-slate-500 italic text-sm border-t border-slate-100 pt-4 mt-2">
                    &ldquo;{current.example}&rdquo;
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-6 justify-center">
            <button onClick={prev} className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium">
              ← Prev
            </button>
            <button onClick={handleDontKnow} className="flex-1 max-w-36 px-4 py-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl hover:bg-red-100 transition-colors text-sm font-medium">
              ✗ Review
            </button>
            <button onClick={handleKnow} className="flex-1 max-w-36 px-4 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-colors text-sm font-medium">
              ✓ Know it!
            </button>
            <button onClick={next} className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium">
              Next →
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-2">
          {filteredWords.map((word, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-4 hover:border-slate-300 transition-colors">
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
              <button
                onClick={() => speak(word.word + ". " + word.example)}
                className="text-slate-300 hover:text-orange-500 transition-colors text-lg flex-shrink-0"
                title="Listen"
              >
                🔊
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
