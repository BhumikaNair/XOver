import React from "react";

function RuleCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <h3 className="text-sm font-semibold text-cyan-300 mb-1">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}

export function GameRulesSection() {
  return (
    <>
      <h2 className="text-xl font-semibold tracking-wide text-gray-200">
        Game Rules
      </h2>

      <div className="mt-4 space-y-4">
        <RuleCard
          title="The Board"
          description="A 3×3 grid of smaller 3×3 grids. Win small boards to claim them, then align three claimed boards to win the game."
        />

        <RuleCard
          title="Making Moves"
          description="Your move in a small board determines which small board your opponent plays next. If sent to a completed board, they may play anywhere."
        />

        <RuleCard
          title="Winning"
          description="Get three in a row on small boards to win them. Get three won boards in a row (horizontally, vertically, or diagonally) to win the game."
        />

        <RuleCard
          title="Strategy Tip"
          description="Think ahead! Each move controls where your opponent plays next. Force them into difficult positions while setting up your own wins."
        />
      </div>
    </>
  );
}
