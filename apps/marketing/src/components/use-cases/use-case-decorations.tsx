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

export { DecorativeDots };
