export function HamburgerButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="md:hidden rounded-lg p-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-purple-900"
      aria-label={open ? "Close menu" : "Open menu"}
    >
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {open ? (
          <path strokeLinecap="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        ) : (
          <path strokeLinecap="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        )}
      </svg>
    </button>
  );
}
