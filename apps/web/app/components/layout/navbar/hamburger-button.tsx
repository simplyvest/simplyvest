import { Button } from "@/components/ui/button";

export function HamburgerButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      aria-label={open ? "Close menu" : "Open menu"}
      className="md:hidden"
    >
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {open ? (
          <path strokeLinecap="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        ) : (
          <path strokeLinecap="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        )}
      </svg>
    </Button>
  );
}
