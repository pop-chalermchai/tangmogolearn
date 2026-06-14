"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Scenario {
  id: string;
  title: string;
  emoji: string;
  description: string;
  systemPrompt: string;
  starterMessage: string;
}

const scenarios: Scenario[] = [
  {
    id: "restaurant",
    title: "At a Restaurant",
    emoji: "🍽️",
    description: "Order food, ask about the menu, and handle common dining situations.",
    starterMessage: "Good evening! Welcome to La Bella. Do you have a reservation?",
    systemPrompt: `You are a friendly restaurant waiter/waitress. Your goal is to simulate a realistic restaurant experience.
    - Greet the customer warmly
    - Help them with the menu, take their order, handle special requests, and manage the bill
    - Use natural, everyday restaurant English
    - If the user makes grammatical errors, gently note the correct form at the end of your reply with: "[Grammar tip: ...]"
    - Keep responses concise and realistic
    - Stay in character as a restaurant staff member throughout`,
  },
  {
    id: "airport",
    title: "At the Airport",
    emoji: "✈️",
    description: "Check in, go through security, and navigate common airport situations.",
    starterMessage: "Good morning! Which airline are you flying with today?",
    systemPrompt: `You are an airport check-in agent. Simulate realistic airport scenarios including:
    - Checking in for a flight
    - Asking about baggage, seat preferences
    - Security questions
    - Gate information and boarding
    - Use common airport English phrases and terminology
    - If the user makes grammatical errors, gently note the correct form: "[Grammar tip: ...]"
    - Keep responses natural and professional`,
  },
  {
    id: "shopping",
    title: "Shopping",
    emoji: "🛍️",
    description: "Ask about products, sizes, prices, returns and exchange policies.",
    starterMessage: "Hi there! Welcome to the store. Are you looking for anything in particular today?",
    systemPrompt: `You are a helpful store assistant. Help the customer with:
    - Finding products, sizes, and colors
    - Asking about prices and discounts
    - Handling returns and exchanges
    - Recommending products
    - Use natural retail English with common shopping vocabulary
    - If the user makes grammatical errors, gently note the correct form: "[Grammar tip: ...]"
    - Be friendly and helpful, stay in character`,
  },
  {
    id: "job-interview",
    title: "Job Interview",
    emoji: "💼",
    description: "Practice answering common interview questions in English.",
    starterMessage: "Good morning! Please have a seat. I'm Alex, the hiring manager. Thank you for coming in today. Can you start by telling me a little about yourself?",
    systemPrompt: `You are a professional hiring manager conducting a job interview.
    - Ask common interview questions (strengths, weaknesses, experience, why this company, where do you see yourself in 5 years, etc.)
    - Give encouraging feedback on their answers
    - Ask follow-up questions naturally
    - Use professional business English
    - If the user makes grammatical errors, gently note the correct form: "[Grammar tip: ...]"
    - At the end of the conversation, give brief overall feedback on their interview performance`,
  },
  {
    id: "doctor",
    title: "Doctor's Appointment",
    emoji: "🏥",
    description: "Describe symptoms, ask questions, and understand medical advice.",
    starterMessage: "Hello! I'm Dr. Johnson. What brings you in today?",
    systemPrompt: `You are a friendly general practitioner (doctor). Help the patient:
    - Describe their symptoms
    - Ask appropriate medical questions
    - Explain diagnoses and treatments in simple English
    - Give health advice
    - Use everyday medical vocabulary (not overly technical)
    - If the user makes grammatical errors, gently note the correct form: "[Grammar tip: ...]"
    - Be empathetic and professional`,
  },
  {
    id: "making-friends",
    title: "Making Friends",
    emoji: "👋",
    description: "Practice casual small talk and making new friends in English.",
    starterMessage: "Hey! I haven't seen you around here before. Are you new to the area?",
    systemPrompt: `You are a friendly, outgoing person meeting someone new. Practice casual conversation:
    - Small talk (weather, hobbies, work, weekend plans)
    - Making plans to hang out
    - Sharing opinions and experiences
    - Natural, casual English with common expressions and idioms
    - If the user makes grammatical errors, gently and casually note the correct form: "[Grammar tip: ...]"
    - Be warm, friendly, and natural — like a real person`,
  },
];

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function DialoguePage() {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionsCount, setSessionsCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("tangmogolearn_progress");
    if (saved) {
      const p = JSON.parse(saved);
      setSessionsCount(p.dialoguesCompleted || 0);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startScenario = useCallback((scenario: Scenario) => {
    setSelectedScenario(scenario);
    setMessages([{ role: "assistant", content: scenario.starterMessage }]);
    setInput("");

    const saved = localStorage.getItem("tangmogolearn_progress");
    const p = saved ? JSON.parse(saved) : {};
    const newCount = (p.dialoguesCompleted || 0) + 1;
    p.dialoguesCompleted = newCount;
    p.lastActiveDate = new Date().toDateString();
    localStorage.setItem("tangmogolearn_progress", JSON.stringify(p));
    setSessionsCount(newCount);
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || loading || !selectedScenario) return;

    const userMessage: Message = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt: selectedScenario.systemPrompt,
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          assistantText += decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: "assistant", content: assistantText };
            return updated;
          });
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't connect. Please check your API key and try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatMessage = (text: string) => {
    const parts = text.split(/(\[Grammar tip:[^\]]*\])/g);
    return parts.map((part, i) => {
      if (part.startsWith("[Grammar tip:")) {
        return (
          <span key={i} className="block mt-2 text-sm bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-3 py-1.5 italic">
            {part.slice(1, -1)}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  if (!selectedScenario) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">💬 Dialogue Simulator</h1>
          <p className="text-slate-600">
            Practice real-life English conversations. AI plays the other person and gives grammar tips along the way.
          </p>
          <div className="mt-2 text-sm text-slate-500">
            Sessions completed: <strong className="text-emerald-600">{sessionsCount}</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => startScenario(scenario)}
              className="text-left bg-white border border-slate-200 rounded-2xl p-6 hover:border-emerald-300 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group"
            >
              <div className="text-4xl mb-3">{scenario.emoji}</div>
              <h3 className="font-bold text-slate-900 text-lg mb-2 group-hover:text-emerald-700 transition-colors">
                {scenario.title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">{scenario.description}</p>
              <div className="mt-4 text-emerald-600 text-sm font-medium">
                Start practice →
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setSelectedScenario(null)}
          className="text-slate-500 hover:text-slate-700 transition-colors"
        >
          ← Back
        </button>
        <span className="text-2xl">{selectedScenario.emoji}</span>
        <div>
          <h2 className="font-bold text-slate-900">{selectedScenario.title}</h2>
          <p className="text-xs text-slate-500">AI grammar tips appear in yellow boxes</p>
        </div>
      </div>

      {/* Chat messages */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="h-[60vh] overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-emerald-600 text-white rounded-br-sm"
                    : "bg-slate-100 text-slate-800 rounded-bl-sm"
                }`}
              >
                {msg.role === "assistant" ? formatMessage(msg.content) : msg.content}
                {loading && i === messages.length - 1 && msg.role === "assistant" && !msg.content && (
                  <span className="inline-flex gap-1">
                    <span className="animate-bounce">.</span>
                    <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>.</span>
                  </span>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-slate-200 p-4 flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Type your reply in English..."
            disabled={loading}
            className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:bg-slate-50"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send →
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <strong>💡 Tip:</strong> Speak naturally as you would in real life. Don&apos;t worry about perfect grammar — the AI will gently correct you. Practice makes perfect!
      </div>
    </div>
  );
}
