import { SectionDecorations, BlobBlob } from "@simplyvest/ui/section-decorations";
import { LuShield } from "react-icons/lu";

export function SecurityDecorations() {
  return (
    <>
      <SectionDecorations>
        <BlobBlob className="absolute -left-40 -top-40 h-96 w-96 bg-purple-300/20 dark:bg-purple-700/20" />
        <BlobBlob className="absolute -bottom-32 -right-32 h-80 w-80 bg-purple-400/10 dark:bg-purple-600/10" />
      </SectionDecorations>

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        aria-hidden
        style={{
          backgroundImage:
            "linear-gradient(rgba(147,51,234,1) 1px, transparent 1px), linear-gradient(90deg, rgba(147,51,234,1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden
      >
        <LuShield className="h-[500px] w-[500px] text-purple-600 dark:text-purple-400 opacity-[0.05]" />
      </div>
    </>
  );
}
