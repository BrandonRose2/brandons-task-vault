import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";

type ButtonState = "idle" | "processing" | "success" | "error";

export default function Home() {
  const [state, setState] = useState<ButtonState>("idle");
  const [pressed, setPressed] = useState(false);

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

  // Auto-reset from error back to idle after 4s
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

  // Color configs per state
  const stateColors = {
    idle: {
      face: "linear-gradient(180deg, #ffd54f 0%, #ffb300 40%, #ff8f00 100%)",
      rim: "linear-gradient(180deg, #e65100 0%, #bf360c 100%)",
      highlight: "rgba(255, 255, 255, 0.45)",
      textColor: "#3e2723",
    },
    processing: {
      face: "linear-gradient(180deg, #ffcc02 0%, #e6a800 40%, #cc8400 100%)",
      rim: "linear-gradient(180deg, #8d5600 0%, #6d4000 100%)",
      highlight: "rgba(255, 255, 255, 0.2)",
      textColor: "#3e2723",
    },
    success: {
      face: "linear-gradient(180deg, #69f0ae 0%, #00c853 40%, #009624 100%)",
      rim: "linear-gradient(180deg, #005f00 0%, #003d00 100%)",
      highlight: "rgba(255, 255, 255, 0.4)",
      textColor: "#1b5e20",
    },
    error: {
      face: "linear-gradient(180deg, #ff8a80 0%, #f44336 40%, #c62828 100%)",
      rim: "linear-gradient(180deg, #8e0000 0%, #5d0000 100%)",
      highlight: "rgba(255, 255, 255, 0.35)",
      textColor: "#4a0000",
    },
  };

  const colors = stateColors[state];
  const isPressed = pressed && state !== "processing";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(ellipse at center, #1a1a2e 0%, #0d0d1a 70%, #000000 100%)",
        overflow: "hidden",
      }}
    >
      {/* Subtle ambient glow behind the button */}
      <div
        style={{
          position: "absolute",
          width: "60%",
          height: "50%",
          borderRadius: "50%",
          background: state === "idle"
            ? "radial-gradient(ellipse, rgba(255, 179, 0, 0.15) 0%, transparent 70%)"
            : state === "success"
            ? "radial-gradient(ellipse, rgba(0, 200, 83, 0.15) 0%, transparent 70%)"
            : state === "error"
            ? "radial-gradient(ellipse, rgba(244, 67, 54, 0.15) 0%, transparent 70%)"
            : "radial-gradient(ellipse, rgba(255, 179, 0, 0.08) 0%, transparent 70%)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />

      {/* 3D Button assembly */}
      <button
        onClick={handleClick}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
        disabled={state === "processing"}
        style={{
          position: "relative",
          width: "clamp(160px, 70vw, 500px)",
          height: "clamp(80px, 30vh, 200px)",
          border: "none",
          borderRadius: "clamp(16px, 3vw, 32px)",
          cursor: state === "processing" ? "wait" : "pointer",
          outline: "none",
          background: colors.rim,
          boxShadow: isPressed
            ? `
              0 2px 4px rgba(0,0,0,0.5),
              0 1px 2px rgba(0,0,0,0.4),
              inset 0 -1px 1px rgba(255,255,255,0.05)
            `
            : `
              0 8px 24px rgba(0,0,0,0.6),
              0 16px 48px rgba(0,0,0,0.4),
              0 4px 8px rgba(0,0,0,0.5),
              inset 0 -2px 4px rgba(255,255,255,0.05)
            `,
          transform: isPressed ? "translateY(6px) scale(0.98)" : "translateY(0) scale(1)",
          transition: "transform 0.1s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.1s cubic-bezier(0.23, 1, 0.32, 1)",
          padding: "0 0 clamp(6px, 1.2vh, 10px) 0",
          userSelect: "none",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        {/* Button face (raised surface) */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            borderRadius: "inherit",
            background: colors.face,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            transform: isPressed ? "translateY(2px)" : "translateY(0)",
            transition: "transform 0.1s cubic-bezier(0.23, 1, 0.32, 1)",
          }}
        >
          {/* Top glossy highlight */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "10%",
              right: "10%",
              height: "45%",
              borderRadius: "0 0 50% 50% / 0 0 100% 100%",
              background: `linear-gradient(180deg, ${colors.highlight} 0%, transparent 100%)`,
              pointerEvents: "none",
              opacity: isPressed ? 0.4 : 1,
              transition: "opacity 0.1s ease",
            }}
          />

          {/* Inner bevel shadow (top-left light, bottom-right dark) */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "inherit",
              boxShadow: isPressed
                ? "inset 0 2px 6px rgba(0,0,0,0.3), inset 0 -1px 2px rgba(255,255,255,0.1)"
                : "inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -2px 6px rgba(0,0,0,0.2)",
              pointerEvents: "none",
              transition: "box-shadow 0.1s ease",
            }}
          />

          {/* Text label */}
          <span
            style={{
              position: "relative",
              zIndex: 1,
              fontSize: "clamp(0.85rem, 3.5vw, 2rem)",
              fontWeight: 800,
              color: colors.textColor,
              textShadow: isPressed
                ? "none"
                : "0 1px 2px rgba(255,255,255,0.3)",
              letterSpacing: "-0.02em",
              textAlign: "center",
              padding: "0 1rem",
              transition: "text-shadow 0.1s ease",
            }}
          >
            {getLabel()}
          </span>
        </div>
      </button>
    </div>
  );
}
