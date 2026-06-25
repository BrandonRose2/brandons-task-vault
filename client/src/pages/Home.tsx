import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";

type ButtonState = "idle" | "processing" | "success" | "error";

export default function Home() {
  const [state, setState] = useState<ButtonState>("idle");

  const mutation = trpc.recordings.trigger.useMutation({
    onSuccess: () => {
      setState("success");
    },
    onError: () => {
      setState("error");
    },
  });

  // Auto-reset from success back to idle after 3s
  useEffect(() => {
    if (state === "success") {
      const timer = setTimeout(() => setState("idle"), 3000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  // Auto-reset from error back to idle after 4s (brief error display)
  useEffect(() => {
    if (state === "error") {
      const timer = setTimeout(() => setState("idle"), 4000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  const handleClick = () => {
    if (state === "processing") return;
    setState("processing");
    mutation.mutate();
  };

  const getLabel = () => {
    switch (state) {
      case "processing":
        return (
          <span className="flex items-center justify-center gap-3">
            <svg
              className="animate-spin shrink-0"
              style={{ width: "1.2em", height: "1.2em" }}
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span>Processing...</span>
          </span>
        );
      case "success":
        return "Recordings sent for processing!";
      case "error":
        return "Error — Tap to Retry";
      default:
        return "New Recordings In";
    }
  };

  const getButtonStyles = () => {
    const base =
      "w-full h-full font-bold cursor-pointer select-none transition-all duration-200 ease-out focus:outline-none flex items-center justify-center";

    switch (state) {
      case "processing":
        return `${base} bg-gradient-to-b from-amber-500 to-amber-700 text-amber-950 opacity-80 cursor-wait`;
      case "success":
        return `${base} bg-gradient-to-b from-emerald-400 to-emerald-600 text-emerald-950`;
      case "error":
        return `${base} bg-gradient-to-b from-red-400 to-red-600 text-red-950`;
      default:
        return `${base} bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600 text-amber-950 hover:from-amber-200 hover:via-amber-300 hover:to-amber-500 active:scale-[0.97] shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)]`;
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={state === "processing"}
      className={getButtonStyles()}
      style={{
        fontSize: "clamp(0.9rem, 4vw, 2.5rem)",
        position: "fixed",
        inset: 0,
        border: "none",
        borderRadius: 0,
      }}
    >
      {getLabel()}
    </button>
  );
}
