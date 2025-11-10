import React from "react";

interface CardProps extends React.PropsWithChildren {
  className?: string;
}

export function Card({ className, children }: CardProps) {
  return (
    <div
      className={
        "rounded-2xl shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_40px_120px_-40px_rgba(0,0,0,0.6)] " +
        (className ?? "")
      }
    >
      {children}
    </div>
  );
}
