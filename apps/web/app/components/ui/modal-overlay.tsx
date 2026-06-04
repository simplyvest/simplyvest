import type * as React from "react";

export function ModalOverlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose?: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="w-full max-w-md rounded-xl border border-border bg-bg1 p-6 shadow-xl">
        {children}
      </div>
    </div>
  );
}
