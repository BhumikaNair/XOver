import React, { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  children: ReactNode;
}

export function Button({
  variant = "primary",
  children,
  ...props
}: ButtonProps) {
  const baseClasses =
    "px-4 py-2 rounded-lg font-medium transition-all duration-200 min-h-11 min-w-11";
  const variantClasses = {
    primary: "bg-black text-white hover:bg-gray-800 active:scale-95",
    secondary: "bg-gray-200 text-black hover:bg-gray-300 active:scale-95",
    ghost: "bg-transparent text-black hover:bg-gray-100 active:scale-95",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${
        props.className || ""
      }`}
      {...props}
    >
      {children}
    </button>
  );
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-[#0b0e14]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_40px_120px_-40px_rgba(0,0,0,0.9)] animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h2 className="text-2xl font-bold mb-4 text-gray-100">{title}</h2>
        )}
        {children}
      </div>
    </div>
  );
}

interface CopyButtonProps {
  text: string;
  label?: string;
  iconOnly?: boolean;
}

export function CopyButton({
  text,
  label = "Copy",
  iconOnly = false,
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Button
      onClick={handleCopy}
      variant="secondary"
      className={`flex items-center justify-center gap-1.5
    bg-white/10 hover:bg-white/20 
    border border-white/20 
    text-gray-200 
    rounded-xl 
    transition-all duration-200 
    ${iconOnly ? "px-2 py-1 min-w-0" : "px-3 py-1.5"}`}
      title={copied ? "Copied!" : "Copy to clipboard"}
    >
      {iconOnly ? (copied ? "✓" : "⧉") : copied ? "✓ Copied!" : label}
    </Button>
  );
}

interface SmallBadgeProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning";
}

export function SmallBadge({ children, variant = "default" }: SmallBadgeProps) {
  const variantClasses = {
    default: "bg-white/10 text-gray-300 border border-white/10",
    success: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30",
    warning: "bg-yellow-500/10 text-yellow-300 border border-yellow-500/30",
  };

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${variantClasses[variant]}`}
    >
      {children}
    </span>
  );
}

interface IconProps {
  type: "x" | "o" | "copy" | "info";
  className?: string;
}

export function Icon({ type, className = "" }: IconProps) {
  if (type === "x") {
    return (
      <svg viewBox="0 0 100 100" className={className} aria-label="X">
        <line
          x1="20"
          y1="20"
          x2="80"
          y2="80"
          stroke="currentColor"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <line
          x1="80"
          y1="20"
          x2="20"
          y2="80"
          stroke="currentColor"
          strokeWidth="12"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (type === "o") {
    return (
      <svg viewBox="0 0 100 100" className={className} aria-label="O">
        <circle
          cx="50"
          cy="50"
          r="30"
          stroke="currentColor"
          strokeWidth="12"
          fill="none"
        />
      </svg>
    );
  }

  if (type === "copy") {
    return (
      <svg
        viewBox="0 0 24 24"
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="9" y="9" width="13" height="13" rx="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
    );
  }

  if (type === "info") {
    return (
      <svg
        viewBox="0 0 24 24"
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    );
  }

  return null;
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-gray-300">{label}</label>
      )}
      <input
        className={`px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-colors min-h-11 text-gray-100 placeholder:text-gray-500 ${className}`}
        {...props}
      />
    </div>
  );
}
