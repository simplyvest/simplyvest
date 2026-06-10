import { Dialog } from "@base-ui/react/dialog";

type Mode = "platform" | "wallet";

type ModeChoiceModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectMode: (mode: Mode) => void;
};

function handleSelect(mode: Mode, onSelectMode: (mode: Mode) => void) {
  onSelectMode(mode);
}

export function ModeChoiceModal({ open, onOpenChange, onSelectMode }: ModeChoiceModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-bg1 p-6 shadow-xl">
          <Dialog.Title className="text-lg font-semibold text-text">
            How would you like to create this token?
          </Dialog.Title>

          <div className="mt-5 grid grid-cols-2 gap-4">
            {/* Platform card */}
            <button
              type="button"
              onClick={() => handleSelect("platform", onSelectMode)}
              className="flex flex-col rounded-xl border border-border p-4 text-left transition-all hover:border-sol hover:bg-sol/5 focus:outline-none focus:ring-2 focus:ring-sol"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sol/10 text-sm">
                  SV
                </span>
                <span className="text-sm font-semibold">Create for Me</span>
              </div>
              <p className="mt-1.5 text-xs text-muted">Free, we handle it</p>

              <ul className="mt-4 space-y-2 text-left text-xs text-text">
                <li className="flex gap-1.5">
                  <span className="shrink-0 text-sol">Gas</span>
                  <span className="text-muted">Covered by SimplyVest</span>
                </li>
                <li className="flex gap-1.5">
                  <span className="shrink-0 text-sol">Signing</span>
                  <span className="text-muted">We create it for your account</span>
                </li>
                <li className="flex gap-1.5">
                  <span className="shrink-0 text-sol">Need</span>
                  <span className="text-muted">Just a connected wallet</span>
                </li>
              </ul>

              <span className="mt-auto pt-4 text-sm font-medium text-sol">
                Create Token on Platform
              </span>
            </button>

            {/* Wallet card */}
            <button
              type="button"
              onClick={() => handleSelect("wallet", onSelectMode)}
              className="flex flex-col rounded-xl border border-border p-4 text-left transition-all hover:border-sol hover:bg-sol/5 focus:outline-none focus:ring-2 focus:ring-sol"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-field text-sm">
                  W
                </span>
                <span className="text-sm font-semibold">Create with Wallet</span>
              </div>
              <p className="mt-1.5 text-xs text-muted">You sign, you control</p>

              <ul className="mt-4 space-y-2 text-left text-xs text-text">
                <li className="flex gap-1.5">
                  <span className="shrink-0 text-sol">Gas</span>
                  <span className="text-muted">You pay ~0.011 SOL</span>
                </li>
                <li className="flex gap-1.5">
                  <span className="shrink-0 text-sol">Signing</span>
                  <span className="text-muted">You sign with your wallet</span>
                </li>
                <li className="flex gap-1.5">
                  <span className="shrink-0 text-sol">Need</span>
                  <span className="text-muted">SOL in your wallet</span>
                </li>
              </ul>

              <span className="mt-auto pt-4 text-sm font-medium text-sol">
                Create Token with Wallet
              </span>
            </button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
