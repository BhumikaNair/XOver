import React from "react";

interface InlineAlertProps {
  tone: "error" | "info" | "success";
  message: string;
  className?: string;
}

export function InlineAlert({ tone, message, className }: InlineAlertProps) {
  const styles =
    tone === "error"
      ? "bg-red-500/10 text-red-300 border-red-500/30"
      : tone === "success"
      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
      : "bg-blue-500/10 text-blue-300 border-blue-500/30";

  return (
    <div
      className={`text-sm px-3 py-2 rounded-lg border ${styles} ${
        className ?? ""
      }`}
      role="alert"
    >
      {message}
    </div>
  );
}
