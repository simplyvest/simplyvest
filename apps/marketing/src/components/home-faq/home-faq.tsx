import { SectionDecorations, BlobBlob } from "@simplyvest/ui/section-decorations";
import * as React from "react";
import { LuArrowRight, LuCircleAlert } from "react-icons/lu";

import { DOCS_URL, FAQ_PATH } from "../../constants";
import { FaqAccordionItem } from "./faq-accordion-item";
import { faqs } from "./faq-data";

export function HomeFAQ() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  return (
    <section className="relative overflow-hidden bg-white dark:bg-slate-900 pb-24 pt-20">
      <SectionDecorations className="select-none">
        <BlobBlob className="absolute -left-20 -top-20 h-64 w-64 bg-purple-200/30 dark:bg-purple-800/30" />
        <BlobBlob className="absolute -bottom-16 -right-16 h-56 w-56 bg-violet-200/20 dark:bg-violet-900/20" />
      </SectionDecorations>

      <div className="relative mx-auto max-w-4xl px-6">
        <div className="border-t border-border pt-14 text-center">
          <div className="font-mono text-[0.68rem] uppercase tracking-wide text-gray-600 dark:text-slate-400">
            05
          </div>
          <h2 className="mt-2">Frequently Asked Questions</h2>
        </div>

        <div className="mt-10">
          {faqs.map((faq, i) => (
            <FaqAccordionItem
              key={faq.q}
              question={faq.q}
              answer={faq.a}
              isOpen={openIndex === i}
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="flex items-center justify-center gap-2 text-muted">
            <LuCircleAlert className="h-4 w-4" aria-hidden="true" focusable="false" />
            <span className="text-sm">Still have questions?</span>
          </div>
          <a
            href={`${DOCS_URL}${FAQ_PATH}`}
            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary no-underline transition-colors hover:text-[#6d28d9] hover:no-underline focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
          >
            View full FAQ
            <LuArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
