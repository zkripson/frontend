"use client";

import { useState, useEffect } from "react";

export function useLoadingSequence(
  messagesList: string[],
  intervalMs: number = 2000
) {
  const [messages, setMessages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loadingDone, setLoadingDone] = useState<boolean>(false);

  useEffect(() => {
    // if we've shown all messages, wait one more interval then mark done
    if (currentIndex >= messagesList.length) {
      const timer = setTimeout(() => {
        setLoadingDone(true);
      }, intervalMs);
      return () => clearTimeout(timer);
    }

    // otherwise, show next message after interval
    const timer = setTimeout(() => {
      setMessages((prev) => [...prev, messagesList[currentIndex]]);
      setCurrentIndex((prev) => prev + 1);
    }, intervalMs);

    return () => clearTimeout(timer);
  }, [currentIndex, messagesList, intervalMs]);

  return { messages, loadingDone };
}
