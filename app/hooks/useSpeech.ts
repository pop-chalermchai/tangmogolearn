import { useRef, useCallback } from "react";

export const useSpeech = () => {
  const isSpeakingRef = useRef(false);

  const speak = useCallback((text: string, rate: number = 1, pitch: number = 1) => {
    if (!text.trim()) return;
    if (isSpeakingRef.current) return;

    isSpeakingRef.current = true;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = 1;
    utterance.lang = "en-US";

    utterance.onend = () => {
      isSpeakingRef.current = false;
    };

    utterance.onerror = () => {
      isSpeakingRef.current = false;
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    isSpeakingRef.current = false;
  }, []);

  const isSpeaking = useCallback(() => isSpeakingRef.current, []);

  return { speak, stop, isSpeaking };
};
