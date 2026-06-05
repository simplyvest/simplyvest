export function FaqItem({
  question,
  answer,
  index,
}: {
  question: string;
  answer: string;
  index: number;
}) {
  return (
    <div>
      {index > 0 && (
        <div className="mb-10 h-px bg-gradient-to-r from-transparent via-purple-200 dark:via-purple-800 to-transparent" />
      )}
      <div className="flex items-start gap-4">
        <span className="mt-2.5 h-2.5 w-2.5 shrink-0 rounded-full bg-purple-500" />
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 md:text-2xl">
            {question}
          </h3>
          <p className="mt-3 text-lg leading-relaxed text-gray-600 dark:text-slate-300">{answer}</p>
        </div>
      </div>
    </div>
  );
}
