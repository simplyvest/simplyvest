import * as React from "react";
import { LuChevronDown } from "react-icons/lu";

import { cn } from "@/utils/cn";

export function FaqAccordionItem({
  question,
  answer,
  isOpen,
  onClick,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <div className="cursor-pointer border-b border-border" onClick={onClick}>
      <div className="flex items-center justify-between py-5">
        <span className="pr-4 text-[0.95rem] font-medium text-text">{question}</span>
        <LuChevronDown
          className={cn(
            "h-4 w-4 shrink-0 transition-transform duration-200 text-gray-600 dark:text-slate-400",
            isOpen && "rotate-180",
          )}
          aria-hidden="true"
          focusable="false"
        />
      </div>
      {isOpen && (
        <div className="pb-5 pr-8">
          <p className="text-[0.9rem] leading-relaxed text-muted">{answer}</p>
        </div>
      )}
    </div>
  );
}
