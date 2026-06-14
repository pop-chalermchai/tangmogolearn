"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ScenarioScript {
  id: string;
  title: string;
  emoji: string;
  systemPrompt: string;
  starterMessage: string;
  description: string;
}

const scenarios: ScenarioScript[] = [
  {
    id: "order-coffee",
    title: "Ordering Coffee",
    emoji: "☕",
    description: "Simple conversation at a coffee shop",
    starterMessage: "Hi! Welcome to Coffee Corner. What can I get for you today?",
    systemPrompt: `You are a friendly barista at a coffee shop. Keep responses short and natural (1-2 sentences).
    - Ask about drink preferences
    - Suggest popular items
    - Ask for name and size
    - Confirm the order
    Keep it simple and beginner-friendly. Respond naturally to what the customer says.`,
  },
  {
    id: "ask-directions",
    title: "Asking for Directions",
    emoji: "🗺️",
    description: "Ask and give directions on the street",
    starterMessage: "Oh hi! Are you looking for something? You look a bit lost!",
    systemPrompt: `You are a helpful person on the street. Keep responses short and natural (1-2 sentences).
    - Help them find places (restaurant, station, bank, etc.)
    - Give simple directions
    - Ask clarifying questions
    Keep language simple and friendly. Respond to what they ask.`,
  },
  {
    id: "weather-smalltalk",
    title: "Weather Small Talk",
    emoji: "🌤️",
    description: "Practice casual weather conversations",
    starterMessage: "Nice weather today, isn't it? Are you enjoying the sunshine?",
    systemPrompt: `You are someone making casual small talk. Keep responses short (1-2 sentences).
    - Comment on weather
    - Ask about their day
    - Suggest activities based on weather
    Keep it light and natural. Respond to what they say.`,
  },
  {
    id: "meet-friend",
    title: "Meeting a Friend",
    emoji: "👋",
    description: "Greet and catch up with a friend",
    starterMessage: "Hey! How have you been? I haven't seen you in forever!",
    systemPrompt: `You are meeting a friend after a long time. Keep responses short and warm (1-2 sentences).
    - Ask how they've been
    - Share what you've been doing
    - Suggest hanging out
    Be friendly and natural. Respond to their stories.`,
  },
];

export default function SpeakingPracticePage() {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioScript | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [userTranscript, setUserTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const recognitionRef = useRef<any>(null);
  const speechSynthesisRef = useRef<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in your browser. Try Chrome, Edge, or Safari.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          setUserTranscript((prev) => (prev ? prev + " " + transcript : transcript));
        } else {
          interim += transcript;
        }
      }
      if (interim) setUserTranscript(interim);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      alert("Error: " + event.error);
    };

    recognitionRef.current = recognition;
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startScenario = useCallback((scenario: ScenarioScript) => {
    setSelectedScenario(scenario);
    setMessages([{ role: "assistant", content: scenario.starterMessage }]);
    setUserTranscript("");
    // Auto-speak the greeting
    speakText(scenario.starterMessage, 0.8);
  }, []);

  const speakText = (text: string, rate: number = 1) => {
    if (speechSynthesisRef.current) return; // Prevent overlapping speech
    speechSynthesisRef.current = true;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.lang = "en-US";

    utterance.onend = () => {
      speechSynthesisRef.current = false;
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (!recognitionRef.current) return;
    setUserTranscript("");
    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
  };

  const sendMessage = async () => {
    if (!userTranscript.trim() || loading || !selectedScenario) return;

    const userMessage: Message = { role: "user", content: userTranscript };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setUserTranscript("");
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

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          assistantText += decoder.decode(value, { stream: true });
        }
      }

      setMessages((prev) => [...prev, { role: "assistant", content: assistantText }]);
      // Speak the response
      speakText(assistantText, 0.9);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I didn't understand. Can you try again?" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedScenario) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">🎤 Speaking Practice</h1>
          <p className="text-slate-600">
            Speak out loud! Record yourself and practice with AI. Your browser will recognize your voice and respond naturally.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-800">
          <strong>📱 How it works:</strong> Click a scenario → Press "Start Recording" → Speak clearly → AI listens and responds → AI speaks back to you
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => startScenario(scenario)}
              className="text-left bg-white border border-slate-200 rounded-2xl p-6 hover:border-orange-300 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group"
            >
              <div className="text-4xl mb-3">{scenario.emoji}</div>
              <h3 className="font-bold text-slate-900 text-lg mb-1 group-hover:text-orange-700 transition-colors">
                {scenario.title}
              </h3>
              <p className="text-slate-600 text-sm">{scenario.description}</p>
              <div className="mt-4 text-orange-600 text-sm font-medium">
                Start practicing →
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <strong>⚠️ Browser Support:</strong> Speech recognition works best in Chrome, Edge, or Safari. Make sure to allow microphone access when prompted.
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
          <p className="text-xs text-slate-500">Speak naturally — AI will respond</p>
        </div>
      </div>

      {/* Chat messages */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm mb-6">
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-orange-600 text-white rounded-br-sm"
                    : "bg-slate-100 text-slate-800 rounded-bl-sm"
                }`}
              >
                {msg.content}
                {loading && i === messages.length - 1 && msg.role === "assistant" && (
                  <span className="inline-flex gap-1 ml-1">
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
      </div>

      {/* Recording section */}
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6">
        <div className="text-center">
          {/* Transcript display */}
          <div className="mb-6">
            <p className="text-xs text-slate-500 mb-2">You said:</p>
            <div className="bg-white border border-orange-200 rounded-xl px-4 py-3 min-h-12 text-center">
              {userTranscript ? (
                <p className="text-slate-800">{userTranscript}</p>
              ) : (
                <p className="text-slate-400 italic">Waiting for your voice...</p>
              )}
            </div>
          </div>

          {/* Recording buttons */}
          <div className="flex gap-3 justify-center mb-4">
            {!isListening ? (
              <button
                onClick={startListening}
                disabled={loading}
                className="flex-1 max-w-48 px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                🎙️ Start Recording
              </button>
            ) : (
              <button
                onClick={stopListening}
                className="flex-1 max-w-48 px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors animate-pulse flex items-center justify-center gap-2"
              >
                ⏹️ Stop
              </button>
            )}

            {userTranscript && !isListening && (
              <button
                onClick={sendMessage}
                disabled={loading}
                className="flex-1 max-w-48 px-6 py-3 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Listening..." : "Send →"}
              </button>
            )}
          </div>

          {userTranscript && !isListening && (
            <button
              onClick={() => setUserTranscript("")}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              Clear & try again
            </button>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 space-y-3 text-sm text-slate-600">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
          <strong>💡 Tips:</strong> Speak clearly and at normal pace. Take your time. Don't rush.
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-3">
          <strong>🔊 Listening:</strong> After you send, the AI will speak back. Listen carefully!
        </div>
      </div>
    </div>
  );
}
