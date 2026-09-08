"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

type AiThankYouMessageProps = {
  donorName: string;
  amount: number;
  impactDescription: string;
  textColor?: string;
};

const AiThankYouMessage = ({
  donorName,
  amount,
  impactDescription,
  textColor,
}: AiThankYouMessageProps) => {
  const t = useTranslations("thankYou.aiMessage");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const requestKey = useRef<string>("");

  useEffect(() => {
    const key = `${donorName}|${amount}|${impactDescription}`;
    if (requestKey.current === key) return;
    requestKey.current = key;

    const controller = new AbortController();

    const run = async () => {
      setIsLoading(true);
      setHasError(false);
      setMessage("");
      try {
        const response = await fetch("/api/thanks", {
          method: "POST",
          signal: controller.signal,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ donorName, amount, impact: impactDescription }),
        });

        if (!response.ok || !response.body) {
          throw new Error(`Unexpected /api/thanks status: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setMessage(accumulated);
        }
      } catch (error) {
        if ((error as Error)?.name === "AbortError") return;
        console.error("Unable to load the AI thank-you message", error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    run();
    return () => controller.abort();
  }, [donorName, amount, impactDescription]);

  if (hasError) {
    return null;
  }

  return (
    <p
      className="w-full max-w-3xl text-base"
      style={{ color: textColor, opacity: 0.85 }}
      aria-live="polite"
    >
      {message || (isLoading ? t("loading") : "")}
    </p>
  );
};

export default AiThankYouMessage;
