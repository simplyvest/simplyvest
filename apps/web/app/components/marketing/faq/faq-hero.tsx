import { SectionDecorations, BlobBlob } from "@/components/ui/section-decorations";

export function FaqHero() {
  return (
    <section className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-gradient-to-br from-white dark:from-slate-950 via-purple-50/20 dark:via-purple-950 to-white dark:to-slate-950">
      <SectionDecorations>
        <BlobBlob className="absolute top-10 left-1/4 h-72 w-72 bg-purple-200/30 dark:bg-purple-800/30" />
        <BlobBlob className="absolute bottom-10 right-1/4 h-64 w-64 bg-violet-200/20" />
      </SectionDecorations>
      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <span className="inline-block rounded-full bg-purple-100 dark:bg-purple-900 px-4 py-1.5 text-sm font-medium text-purple-700 dark:text-purple-300">
          FAQ
        </span>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 dark:text-slate-100 sm:text-5xl">
          Frequently Asked Questions
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-slate-300">
          Common questions about SimplyVest, token vesting, and the protocol.
        </p>
      </div>
    </section>
  );
}
