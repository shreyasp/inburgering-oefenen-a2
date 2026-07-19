import type { BankQuestion } from "../data/types";

interface AnswerReviewProps {
  question: BankQuestion;
  questionId: string;
  questionNumber: number;
  userAnswer: string | undefined;
}

export function AnswerReview({
  question,
  questionId: _questionId,
  questionNumber,
  userAnswer,
}: AnswerReviewProps) {
  const isCorrect = userAnswer === question.correct_answer;
  const isUnanswered = userAnswer === undefined;

  return (
    <div
      className={`rounded-lg border p-4 ${
        isCorrect
          ? "border-exam-success bg-exam-success-light"
          : isUnanswered
            ? "border-gray-200 bg-gray-50"
            : "border-exam-danger bg-exam-danger-light"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-semibold text-gray-700">
          Vraag {questionNumber}
        </span>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            isCorrect
              ? "bg-exam-success text-white"
              : isUnanswered
                ? "bg-gray-400 text-white"
                : "bg-exam-danger text-white"
          }`}
        >
          {isCorrect ? "Goed" : isUnanswered ? "Geen antwoord" : "Fout"}
        </span>
      </div>
      <p className="text-sm text-gray-800 mb-3">{question.questiontext}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        {userAnswer && (
          <div
            className={`px-3 py-1.5 rounded border ${
              isCorrect
                ? "border-exam-success"
                : "border-exam-danger bg-exam-danger-light"
            }`}
          >
            <span className="text-gray-500">Uw antwoord: </span>
            <span className="font-medium">
              {userAnswer}:{" "}
              {question.options.find((o) => o.label === userAnswer)?.text}
            </span>
          </div>
        )}
        {!isCorrect && (
          <div className="px-3 py-1.5 rounded border border-exam-success bg-exam-success-light">
            <span className="text-gray-500">Juiste antwoord: </span>
            <span className="font-medium">
              {question.correct_answer}:{" "}
              {
                question.options.find((o) => o.label === question.correct_answer)
                  ?.text
              }
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
