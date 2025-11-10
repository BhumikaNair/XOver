import React from "react";

function ControlHint({ keys, label }: { keys: string[]; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 text-xs text-gray-400">
      <div className="inline-flex items-center gap-1">
        {keys.map((k) => (
          <kbd
            key={k}
            className="px-1.5 py-0.5 rounded border border-white/10 bg-black/40 text-gray-200"
          >
            {k}
          </kbd>
        ))}
      </div>
      <span className="text-gray-500">=</span>
      <span>{label}</span>
    </div>
  );
}

function PlayModeCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <h4 className="text-sm font-semibold text-cyan-300 mb-1.5">{title}</h4>
      <p className="text-xs text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}

export function HowToPlaySection() {
  return (
    <>
      <h3 className="text-lg font-semibold tracking-wide text-gray-200">
        How to Play Online
      </h3>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <PlayModeCard
          title="Host"
          description="Press H or Host to create and share game code."
        />
        <PlayModeCard
          title="Join"
          description="Press J or Join to enter code and connect"
        />
        <PlayModeCard
          title="Local"
          description="Press L for two-player mode on the same device."
        />
      </div>
      <div className="mt-4 pt-4 border-t border-white/10">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">
          Keyboard Shortcuts
        </h4>
        <div className="flex flex-wrap items-center gap-3">
          <ControlHint keys={["L"]} label="Local" />
          <ControlHint keys={["H"]} label="Host" />
          <ControlHint keys={["J"]} label="Join" />
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-2">
          <ControlHint keys={["Esc"]} label="Close dialogs" />
          <ControlHint keys={["Enter"]} label="Confirm box" />
        </div>
      </div>
    </>
  );
}
