import type { BankQuestion } from "../data/types";

interface QuestionCardProps {
  question: BankQuestion;
  questionId: string;
  questionNumber: number;
  selectedAnswer: string | undefined;
  isBookmarked: boolean;
  onAnswer: (questionId: string, answer: string) => void;
  onToggleBookmark: () => void;
}

export function QuestionCard({
  question,
  questionId,
  questionNumber,
  selectedAnswer,
  isBookmarked,
  onAnswer,
  onToggleBookmark,
}: QuestionCardProps) {
  const optionKeys = ["ArrowA", "ArrowB", "ArrowC", "ArrowD"];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-exam-gray font-medium">
          Vraag {questionNumber}
        </div>
        <button
          type="button"
          onClick={onToggleBookmark}
          className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors"
          aria-label={`Bladwijzer voor vraag ${questionNumber}`}
        >
          <span className={isBookmarked ? "text-amber-500 text-lg" : "text-gray-300 text-lg"}>
            {isBookmarked ? "★" : "☆"}
          </span>
        </button>
      </div>
      <p className="text-base font-medium text-gray-900">{question.questiontext}</p>

      <fieldset>
        <legend className="sr-only">Kies uw antwoord</legend>
        <div className="flex flex-col gap-2">
          {question.options.map((opt) => {
            const isSelected = selectedAnswer === opt.label;

            return (
              <label
                key={opt.label}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer
                  transition-colors
                  ${isSelected
                    ? "border-exam-blue bg-exam-blue-light"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                  }
                `}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onAnswer(questionId, opt.label);
                  }
                  const arrowIdx = optionKeys.indexOf(e.key);
                  if (arrowIdx >= 0 && arrowIdx < question.options.length) {
                    e.preventDefault();
                    onAnswer(questionId, question.options[arrowIdx].label);
                  }
                }}
              >
                <input
                  type="radio"
                  name={`question-${questionId}`}
                  value={opt.label}
                  checked={isSelected}
                  onChange={() => onAnswer(questionId, opt.label)}
                  className="sr-only"
                />
                <span
                  className={`
                    flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center
                    text-sm font-semibold border
                    ${isSelected
                      ? "bg-exam-blue text-white border-exam-blue"
                      : "bg-white text-gray-500 border-gray-300"
                    }
                  `}
                >
                  {opt.label}
                </span>
                <span className="text-gray-800">{opt.text}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
