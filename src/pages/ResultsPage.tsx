import { useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadQuestionBank, getQuestionById, recordAttempt, type BankEntry } from "../data";
import { useExam, useExamActions, saveAttemptHistory } from "../context/ExamContext";
import { AnswerReview } from "../components/AnswerReview";
import { ReadingText } from "../components/ReadingText";
import { NavBar } from "../components/NavBar";

function answerKey(entryId: number, qIdx: number): string {
  return `${entryId}:${qIdx}`;
}

export function ResultsPage() {
  const navigate = useNavigate();
  const { state } = useExam();
  const { reset } = useExamActions();

  // Reconstruct entries from askedQuestionIds
  const examEntries = useMemo(() => {
    loadQuestionBank();
    return state.askedQuestionIds
      .map((id) => getQuestionById(id))
      .filter((e): e is BankEntry => e !== undefined);
  }, [state.askedQuestionIds]);

  // Flatten all questions
  const allQuestions = useMemo(() => {
    return examEntries.flatMap((entry) =>
      entry.questions.map((q, qIdx) => ({
        question: q,
        questionId: answerKey(entry.id, qIdx),
        entry,
      })),
    );
  }, [examEntries]);

  const totalQuestions = allQuestions.length;

  const score = useMemo(() => {
    let correct = 0;
    for (const { question, questionId } of allQuestions) {
      if (state.answers[questionId] === question.correct_answer) {
        correct++;
      }
    }
    return correct;
  }, [allQuestions, state.answers]);

  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const passed = percentage >= 72;

  const slaagkans = useMemo(() => {
    if (score <= 12) return { label: "Geen kans", color: "text-exam-danger" };
    if (score <= 17)
      return { label: "Weinig kans", color: "text-exam-warning" };
    if (score <= 22) return { label: "Kans", color: "text-exam-blue" };
    return { label: "Veel kans", color: "text-exam-success" };
  }, [score]);

  // Record attempts and save history
  useEffect(() => {
    if (state.status !== "submitted" || allQuestions.length === 0) return;

    for (const { question, questionId } of allQuestions) {
      const isCorrect = state.answers[questionId] === question.correct_answer;
      recordAttempt(questionId, isCorrect);
    }

    saveAttemptHistory({
      score,
      totalQuestions,
      timestamp: Date.now(),
      timeTaken: state.startTime && state.endTime
        ? Math.round((state.endTime - state.startTime) / 1000)
        : 0,
    });
  }, [state.status, allQuestions, state.answers, score, totalQuestions]);

  const handleRetry = () => {
    reset();
    navigate("/exam", { replace: true });
  };

  const handleBack = () => {
    reset();
    navigate("/", { replace: true });
  };

  if (examEntries.length === 0) {
    return (
      <div className="min-h-screen bg-exam-bg flex flex-col">
        <NavBar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">
            Resultaten niet beschikbaar. Maak eerst een toets.
          </p>
        </div>
      </div>
    );
  }

  // Group questions by entry for display with reading text
  const entriesWithAnswers = examEntries.map((entry) => {
    const qs = entry.questions.map((q, qIdx) => ({
      question: q,
      questionId: answerKey(entry.id, qIdx),
      userAnswer: state.answers[answerKey(entry.id, qIdx)],
      isCorrect: state.answers[answerKey(entry.id, qIdx)] === q.correct_answer,
    }));
    return { entry, questions: qs };
  });

  let globalQNum = 0;

  return (
    <main className="min-h-screen bg-exam-bg">
      <NavBar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Score header */}
        <section className="bg-white rounded-lg border border-gray-200 p-6 mb-6 text-center">
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-bold mb-4 ${
              passed
                ? "bg-exam-success-light text-exam-success"
                : "bg-exam-danger-light text-exam-danger"
            }`}
          >
            {passed ? "Geslaagd" : "Niet geslaagd"}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {score} van de {totalQuestions} vragen goed
          </h1>
          <p className="text-4xl font-bold text-gray-900 mb-3">
            {percentage}%
          </p>

          <p className={`text-sm font-medium ${slaagkans.color}`}>
            Slaagkans: {slaagkans.label}
          </p>
        </section>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <button
            type="button"
            onClick={handleRetry}
            className="flex-1 py-3 bg-exam-blue text-white text-sm font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-exam-blue focus:ring-offset-2 transition-colors"
          >
            Opnieuw proberen
          </button>
          <button
            type="button"
            onClick={handleBack}
            className="flex-1 py-3 bg-white text-gray-700 text-sm font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-exam-blue focus:ring-offset-2 transition-colors"
          >
            Terug naar toetsen
          </button>
        </div>

        {/* Answer review grouped by entry */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Antwoorden bekijken
          </h2>
          <div className="flex flex-col gap-6">
            {entriesWithAnswers.map(({ entry, questions }) => (
              <div key={entry.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">{entry.title}</h3>
                  {entry.difficulty && (
                    <span className="text-xs text-gray-500">
                      {entry.difficulty === "easy" ? "Makkelijk" : entry.difficulty === "hard" ? "Moeilijk" : "Gemiddeld"}
                    </span>
                  )}
                </div>
                <div className="px-4 py-3">
                  <ReadingText
                    title=""
                    content={entry.text}
                    table={entry.table}
                  />
                </div>
                <div className="px-4 pb-4 flex flex-col gap-3">
                  {questions.map(({ question, questionId, userAnswer }) => {
                    globalQNum++;
                    return (
                      <AnswerReview
                        key={questionId}
                        question={question}
                        questionId={questionId}
                        questionNumber={globalQNum}
                        userAnswer={userAnswer}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
