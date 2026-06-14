"use client";

import Link from "next/link";
import { useState, useCallback, useEffect } from "react";

interface Topic {
  id: string;
  title: string;
  emoji: string;
  level: "beginner" | "intermediate" | "advanced";
  description: string;
  prompt: string;
}

const speakingTopics: Topic[] = [
  {
    id: "introduce",
    title: "Introduce Yourself",
    emoji: "👋",
    level: "beginner",
    description: "Learn how to introduce yourself naturally in English.",
    prompt: "Give me a complete guide on how to introduce yourself in English in different situations (casual, professional, social). Include: key phrases, example scripts, common mistakes to avoid, and pronunciation tips for Thai speakers. Make it practical and easy to remember.",
  },
  {
    id: "small-talk",
    title: "Small Talk Mastery",
    emoji: "💬",
    level: "beginner",
    description: "Master the art of casual conversation and small talk.",
    prompt: "Teach me how to do small talk in English naturally. Include: 10 common small talk topics, opening lines, how to keep conversation going, how to politely exit a conversation, and example mini dialogues. Focus on topics relevant to everyday life.",
  },
  {
    id: "express-opinions",
    title: "Expressing Opinions",
    emoji: "🗣️",
    level: "intermediate",
    description: "Learn to share your thoughts and opinions confidently.",
    prompt: "Teach me English phrases and techniques for expressing opinions, agreeing, and disagreeing politely. Include: how to soften opinions, useful phrases (I think, In my opinion, I believe, From my perspective, etc.), how to agree/disagree respectfully, and practice sentences.",
  },
  {
    id: "phone-calls",
    title: "Phone Calls & Video Calls",
    emoji: "📞",
    level: "intermediate",
    description: "Handle phone and video calls professionally in English.",
    prompt: "Give me a complete guide to handling phone and video calls in English. Cover: how to answer/make a business call, common phrases (hold please, I'll transfer you, Could you repeat that?), leaving voicemails, and informal calls to friends. Include scripts I can practice.",
  },
  {
    id: "presentations",
    title: "Giving Presentations",
    emoji: "📊",
    level: "advanced",
    description: "Deliver confident presentations and speeches in English.",
    prompt: "Teach me how to give a presentation in English. Include: how to open/close strongly, transition phrases (Moving on to..., Let me elaborate..., To summarize...), handling Q&A, tips for non-native speakers, and a sample presentation structure I can use.",
  },
  {
    id: "pronunciation",
    title: "Pronunciation for Thai Speakers",
    emoji: "🎯",
    level: "beginner",
    description: "Common pronunciation challenges and how to fix them.",
    prompt: "What are the most common English pronunciation challenges for Thai speakers, and how to fix them? Cover: consonant clusters (str-, spr-), final consonants that Thai often drops, vowel sounds (/æ/ vs /ɑ/, /ɪ/ vs /iː/), and the 'th' sound. Give practice words and sentences for each issue.",
  },
  {
    id: "idioms",
    title: "Common Idioms & Phrases",
    emoji: "🧩",
    level: "intermediate",
    description: "Learn the idioms native English speakers use every day.",
    prompt: "Teach me 20 common English idioms and phrases that native speakers use in everyday conversation. For each one: the idiom, its meaning, example sentence in context, and a note on when it's appropriate to use (casual/formal). Group them by theme if possible.",
  },
  {
    id: "storytelling",
    title: "Storytelling & Narrating",
    emoji: "📖",
    level: "advanced",
    description: "Tell engaging stories and narrate events in English.",
    prompt: "Teach me how to tell stories and narrate events in English engagingly. Cover: past tense storytelling structures, sequence words (first, then, after that, suddenly, eventually), how to make stories interesting, phrases for emphasis, and give me a practice story framework I can use.",
  },
];

interface SessionState {
  topic: Topic;
  coaching: string;
  loading: boolean;
}

const levelColors = {
  beginner: "bg-emerald-100 text-emerald-700",
  intermediate: "bg-yellow-100 text-yellow-700",
  advanced: "bg-red-100 text-red-700",
};

export default function SpeakingPage() {
  const [session, setSession] = useState<SessionState | null>(null);
  const [sessionsCount, setSessionsCount] = useState(0);
  const [customTopic, setCustomTopic] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("tangmogolearn_progress");
    if (saved) {
      const p = JSON.parse(saved);
      setSessionsCount(p.speakingSessionsDone || 0);
    }
  }, []);

  const startSession = useCallback(async (topic: Topic, customPrompt?: string) => {
    setSession({ topic, coaching: "", loading: true });

    const saved = localStorage.getItem("tangmogolearn_progress");
    const p = saved ? JSON.parse(saved) : {};
    const newCount = (p.speakingSessionsDone || 0) + 1;
    p.speakingSessionsDone = newCount;
    p.lastActiveDate = new Date().toDateString();
    localStorage.setItem("tangmogolearn_progress", JSON.stringify(p));
    setSessionsCount(newCount);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt: `You are an expert English speaking coach specializing in helping Thai speakers improve their English speaking ability.
          Provide clear, practical, and encouraging coaching. Use examples extensively. Format your response with clear sections using markdown-style headers (##) and bullet points for easy reading.`,
          messages: [
            { role: "user", content: customPrompt || topic.prompt },
          ],
        }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let text = "";

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setSession((prev) => prev ? { ...prev, coaching: text, loading: false } : null);
      }
    } catch {
      setSession((prev) =>
        prev ? { ...prev, coaching: "Could not connect to AI coach. Please check your API key.", loading: false } : null
      );
    }
  }, []);

  const startCustom = () => {
    if (!customTopic.trim()) return;
    const topic: Topic = {
      id: "custom",
      title: "Custom Topic",
      emoji: "✨",
      level: "intermediate",
      description: customTopic,
      prompt: customTopic,
    };
    setShowCustom(false);
    setCustomTopic("");
    startSession(topic, customTopic);
  };

  const formatCoaching = (text: string) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("## ")) {
        return (
          <h3 key={i} className="text-lg font-bold text-slate-900 mt-6 mb-2">
            {line.slice(3)}
          </h3>
        );
      }
      if (line.startsWith("# ")) {
        return (
          <h2 key={i} className="text-xl font-bold text-slate-900 mt-4 mb-2">
            {line.slice(2)}
          </h2>
        );
      }
      if (line.startsWith("- ") || line.startsWith("• ")) {
        return (
          <li key={i} className="ml-4 text-slate-700 leading-relaxed">
            {line.slice(2)}
          </li>
        );
      }
      if (line.startsWith("**") && line.endsWith("**")) {
        return (
          <p key={i} className="font-semibold text-slate-900 mt-2">
            {line.slice(2, -2)}
          </p>
        );
      }
      if (!line.trim()) return <br key={i} />;
      return (
        <p key={i} className="text-slate-700 leading-relaxed">
          {line.replace(/\*\*(.*?)\*\*/g, (_, match) => match).split("**").map((part, j) =>
            j % 2 === 1 ? <strong key={j}>{part}</strong> : part
          )}
        </p>
      );
    });
  };

  if (session) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setSession(null)}
            className="text-slate-500 hover:text-slate-700 transition-colors text-sm"
          >
            ← Back
          </button>
          <span className="text-2xl">{session.topic.emoji}</span>
          <h2 className="font-bold text-slate-900">{session.topic.title}</h2>
          {session.loading && (
            <span className="text-sm text-orange-600 animate-pulse ml-2">✨ AI Coach is preparing...</span>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm min-h-64">
          {session.loading && !session.coaching ? (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <div className="text-center">
                <div className="text-4xl mb-4 animate-bounce">🎤</div>
                <p>Your speaking coach is preparing personalized guidance...</p>
              </div>
            </div>
          ) : (
            <div className="prose prose-slate max-w-none">
              {formatCoaching(session.coaching)}
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={() => startSession(session.topic)}
            className="px-4 py-2 bg-orange-600 text-white rounded-xl text-sm font-medium hover:bg-orange-700 transition-colors"
          >
            🔄 Get New Coaching
          </button>
          <button
            onClick={() => setSession(null)}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Choose Another Topic
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">🎤 Speaking Coach</h1>
        <p className="text-slate-600">
          Get AI-powered speaking guidance, pronunciation tips, and practice scripts for everyday English.
        </p>
        <div className="mt-2 text-sm text-slate-500">
          Sessions completed: <strong className="text-orange-600">{sessionsCount}</strong>
        </div>
      </div>

      {/* Mode selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Speaking Coach (Text-based) */}
        <div className="bg-white border-2 border-orange-200 rounded-2xl p-6">
          <div className="text-4xl mb-3">📚</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Speaking Coach</h2>
          <p className="text-slate-600 text-sm mb-4">
            Get personalized guidance on pronunciation, phrases, and speaking techniques. Read at your own pace.
          </p>
          <button
            onClick={() => setShowCustom(true)}
            className="w-full px-4 py-2.5 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 transition-colors text-sm"
          >
            Read Coaching →
          </button>
        </div>

        {/* Speaking Practice (Voice-based) */}
        <div className="bg-white border-2 border-emerald-200 rounded-2xl p-6">
          <div className="text-4xl mb-3">🎙️</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Speaking Practice</h2>
          <p className="text-slate-600 text-sm mb-4">
            Speak out loud! Record yourself and practice real conversations. AI listens and responds.
          </p>
          <Link
            href="/speaking/practice"
            className="block w-full px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors text-sm text-center"
          >
            Start Speaking →
          </Link>
        </div>
      </div>

      {/* Custom topic */}
      <div className="mb-6 bg-orange-50 border border-orange-200 rounded-2xl p-4">
        {showCustom ? (
          <div className="flex gap-3">
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && startCustom()}
              placeholder="E.g., How do I talk about my feelings in English?"
              className="flex-1 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              autoFocus
            />
            <button
              onClick={startCustom}
              disabled={!customTopic.trim()}
              className="px-4 py-2 bg-orange-600 text-white rounded-xl text-sm font-medium hover:bg-orange-700 disabled:opacity-50 transition-colors"
            >
              Ask Coach →
            </button>
            <button
              onClick={() => setShowCustom(false)}
              className="px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowCustom(true)}
            className="flex items-center gap-2 text-orange-700 font-medium text-sm"
          >
            <span className="text-xl">✨</span>
            Ask the coach anything about English speaking...
          </button>
        )}
      </div>

      {/* Topic grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {speakingTopics.map((topic) => (
          <button
            key={topic.id}
            onClick={() => startSession(topic)}
            className="text-left bg-white border border-slate-200 rounded-2xl p-5 hover:border-orange-300 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group"
          >
            <div className="text-3xl mb-3">{topic.emoji}</div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${levelColors[topic.level]}`}>
                {topic.level}
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1.5 group-hover:text-orange-700 transition-colors">
              {topic.title}
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed">{topic.description}</p>
            <div className="mt-3 text-orange-600 text-xs font-medium">
              Get coaching →
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
