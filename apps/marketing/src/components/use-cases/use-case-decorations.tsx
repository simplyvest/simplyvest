import * as React from "react";

function DecorativeDots() {
  return (
    <svg
      className="absolute right-5 top-5 h-4 w-4 text-purple-300/60 dark:text-purple-400/60"
      viewBox="0 0 16 16"
      fill="currentColor"
    >
      <circle cx="2" cy="2" r="1.5" />
      <circle cx="8" cy="2" r="1.5" />
      <circle cx="14" cy="2" r="1.5" />
    </svg>
  );
}

function BottomCircles() {
  return (
    <svg
      className="absolute bottom-4 left-1/2 h-6 w-16 -translate-x-1/2 text-purple-200/40 dark:text-purple-400/40"
      viewBox="0 0 64 24"
      fill="currentColor"
    >
      <circle cx="8" cy="12" r="3" />
      <circle cx="20" cy="12" r="3" />
      <circle cx="32" cy="12" r="3" />
      <circle cx="44" cy="12" r="3" />
      <circle cx="56" cy="12" r="3" />
    </svg>
  );
}

export { DecorativeDots, BottomCircles };
