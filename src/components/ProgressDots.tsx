interface ProgressDotsProps {
  total: number;
  current: number;
  completedSet: Set<number>;
  bookmarks: Set<number>;
  onDotClick: (index: number) => void;
}

export function ProgressDots({
  total,
  current,
  completedSet,
  bookmarks,
  onDotClick,
}: ProgressDotsProps) {
  return (
    <div className="flex items-center gap-1.5" role="list" aria-label="Voortgang vragen">
      {Array.from({ length: total }, (_, i) => {
        const entryNum = i;
        const isCurrent = i === current;
        const isCompleted = completedSet.has(entryNum);
        const isBookmarked = bookmarks.has(entryNum);

        let dotClass =
          "w-3.5 h-3.5 rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-exam-blue p-0.5";

        if (isCurrent) {
          dotClass += " bg-exam-blue border-exam-blue ring-2 ring-exam-blue/25";
        } else if (isCompleted) {
          dotClass += " bg-gray-400 border-gray-400";
        } else {
          dotClass += " bg-transparent border-gray-300 hover:border-gray-400";
        }

        if (isBookmarked && !isCurrent) {
          dotClass += " ring-2 ring-amber-400";
        }

        return (
          <button
            key={i}
            type="button"
            className={dotClass}
            onClick={() => onDotClick(i)}
            aria-label={`Tekst ${entryNum + 1}${isCompleted ? ", beantwoord" : ""}${isBookmarked ? ", bladwijzer" : ""}${isCurrent ? ", huidige tekst" : ""}`}
          />
        );
      })}
    </div>
  );
}
