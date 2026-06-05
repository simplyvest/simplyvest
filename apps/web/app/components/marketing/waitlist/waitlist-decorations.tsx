import { SectionDecorations, BlobBlob } from "@/components/ui/section-decorations";

export function WaitlistDecorations() {
  return (
    <SectionDecorations>
      <BlobBlob className="absolute -left-32 top-20 h-96 w-96 bg-purple-300 opacity-5 dark:bg-purple-700" />
      <BlobBlob className="absolute -right-24 top-1/2 h-80 w-80 bg-purple-400 opacity-5 dark:bg-purple-600" />
      <BlobBlob className="absolute bottom-10 left-1/3 h-64 w-64 bg-purple-200 opacity-5 dark:bg-purple-800" />
      <div className="absolute left-10 top-1/3 h-48 w-48 rotate-45 rounded-3xl border border-purple-300 opacity-5 dark:border-purple-700" />
      <div className="absolute bottom-1/4 right-1/4 h-32 w-32 rotate-12 rounded-2xl border border-purple-400 opacity-5 dark:border-purple-600" />
    </SectionDecorations>
  );
}
