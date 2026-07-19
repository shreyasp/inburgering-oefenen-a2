import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  loadQuestionBank,
  pickTableQuestion,
  pickNonTableQuestion,
  isAllMastered,
  type BankEntry,
} from "../data";
import { useExamActions } from "../context/ExamContext";
import { useTimer } from "../hooks/useTimer";
import { Timer } from "../components/Timer";
import { ProgressDots } from "../components/ProgressDots";
import { ReadingText } from "../components/ReadingText";
import { QuestionCard } from "../components/QuestionCard";

const EXAM_DURATION = 65 * 60; // 65 minutes

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function answerKey(entryId: number, qIdx: number): string {
  return `${entryId}:${qIdx}`;
}

export function ExamPage() {
  const navigate = useNavigate();
  const { state, startTest, answerQuestion, goToQuestion, nextQuestion, submit, toggleBookmark, addQuestion, reset } =
    useExamActions();
  const [started, setStarted] = useState(false);
  const [examEntries, setExamEntries] = useState<BankEntry[]>([]);
  const pickedRef = useRef(false);

  // Pick entries on first mount
  useEffect(() => {
    if (pickedRef.current) return;
    pickedRef.current = true;

    loadQuestionBank();

    if (isAllMastered()) return;

    const entries: BankEntry[] = [];
    const exclude = new Set<number>();

    // Try to pick 3 table entries
    for (let i = 0; i < 3; i++) {
      const entry = pickTableQuestion(exclude);
      if (!entry) break;
      entries.push(entry);
      exclude.add(entry.id);
    }

    // Fill remaining with non-table entries aiming for ~25 total questions
    let totalQ = entries.reduce((sum, e) => sum + e.questions.length, 0);
    let attempts = 0;
    while (totalQ < 25 && attempts < 200) {
      const entry = pickNonTableQuestion(exclude);
      if (!entry) break;
      entries.push(entry);
      exclude.add(entry.id);
      totalQ += entry.questions.length;
      attempts++;
    }

    const shuffled = shuffle(entries);
    setExamEntries(shuffled);

    // Dispatch ADD_QUESTION for each entry
    for (const entry of shuffled) {
      addQuestion(entry.id);
    }
  }, [addQuestion]);

  // Start test
  useEffect(() => {
    if (!started && examEntries.length > 0) {
      startTest();
      setStarted(true);
    }
  }, [started, examEntries.length, startTest]);

  const totalEntries = examEntries.length;
  const currentEntry = examEntries[state.currentQuestionIndex];

  const isLastEntry = state.currentQuestionIndex === totalEntries - 1;
  const isFirstEntry = state.currentQuestionIndex === 0;

  // Check if all questions in current entry are answered
  const currentEntryAllAnswered = useMemo(() => {
    if (!currentEntry) return false;
    return currentEntry.questions.every((_, qIdx) =>
      state.answers[answerKey(currentEntry.id, qIdx)] !== undefined
    );
  }, [currentEntry, state.answers]);

  // Build completed set: entries where ALL questions are answered
  const completedSet = useMemo(() => {
    const s = new Set<number>();
    for (let i = 0; i < examEntries.length; i++) {
      const entry = examEntries[i];
      if (entry.questions.every((_, qIdx) => state.answers[answerKey(entry.id, qIdx)] !== undefined)) {
        s.add(i);
      }
    }
    return s;
  }, [examEntries, state.answers]);

  const totalQuestions = useMemo(
    () => examEntries.reduce((sum, e) => sum + e.questions.length, 0),
    [examEntries],
  );
  const answeredCount = Object.keys(state.answers).length;

  const handleSubmit = useCallback(() => {
    submit();
    navigate("/results", { replace: true });
  }, [submit, navigate]);

  const [showConfirm, setShowConfirm] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const unansweredCount = totalQuestions - answeredCount;

  const handleQuit = () => {
    reset();
    navigate("/", { replace: true });
  };

  const handleSubmitClick = () => {
    if (unansweredCount > 0) {
      setShowConfirm(true);
    } else {
      handleSubmit();
    }
  };

  const { minutes, seconds, isWarning, isDanger } = useTimer(
    EXAM_DURATION,
    handleSubmit,
  );

  if (totalEntries === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-exam-bg">
        <div className="text-center">
          {isAllMastered() ? (
            <p className="text-gray-500">
              U heeft alle vragen goed beantwoord! Stuur nieuwe voorbeeldteksten om meer vragen toe te voegen.
            </p>
          ) : (
            <p className="text-gray-500">Geen vragen beschikbaar.</p>
          )}
        </div>
      </main>
    );
  }

  if (!currentEntry) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-exam-bg">
        <p className="text-gray-500">Laden...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* Top bar */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-full mx-auto px-4 py-2 flex items-center gap-4">
          <Timer
            minutes={minutes}
            seconds={seconds}
            isWarning={isWarning}
            isDanger={isDanger}
          />
          <div className="flex-1 flex justify-center">
            <ProgressDots
              total={totalEntries}
              current={state.currentQuestionIndex}
              completedSet={completedSet}
              bookmarks={state.bookmarks}
              onDotClick={goToQuestion}
            />
          </div>
          <span className="text-sm text-exam-gray font-medium whitespace-nowrap">
            {answeredCount}/{totalQuestions}
          </span>
          <button
            type="button"
            onClick={() => setShowQuitConfirm(true)}
            className="text-sm font-medium text-gray-400 hover:text-exam-danger transition-colors px-2 py-1"
          >
            Stoppen
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left panel: reading text */}
        <section className="md:w-3/5 border-r border-gray-200 overflow-y-auto bg-gray-50">
          <ReadingText
            title={currentEntry.title}
            content={currentEntry.text}
            table={currentEntry.table}
          />
        </section>

        {/* Right panel: questions */}
        <section className="md:w-2/5 overflow-y-auto bg-white">
          <div className="px-4 py-6 flex flex-col gap-6">
            {currentEntry.questions.map((q, qIdx) => (
              <QuestionCard
                key={answerKey(currentEntry.id, qIdx)}
                question={q}
                questionId={answerKey(currentEntry.id, qIdx)}
                questionNumber={qIdx + 1}
                selectedAnswer={state.answers[answerKey(currentEntry.id, qIdx)]}
                isBookmarked={state.bookmarks.includes(currentEntry.id)}
                onAnswer={answerQuestion}
                onToggleBookmark={() => toggleBookmark(currentEntry.id)}
              />
            ))}

            {/* Navigation */}
            <div className="flex gap-3">
              {!isFirstEntry && (
                <button
                  type="button"
                  onClick={() => goToQuestion(state.currentQuestionIndex - 1)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-exam-blue focus:ring-offset-2 transition-colors"
                >
                  Vorige
                </button>
              )}
              {isLastEntry ? (
                <button
                  type="button"
                  onClick={handleSubmitClick}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-exam-blue text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-exam-blue focus:ring-offset-2 transition-colors"
                >
                  Inleveren
                </button>
              ) : (
                <button
                  type="button"
                  onClick={nextQuestion}
                  disabled={!currentEntryAllAnswered}
                  className={`
                    flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors
                    focus:outline-none focus:ring-2 focus:ring-exam-blue focus:ring-offset-2
                    ${
                      currentEntryAllAnswered
                        ? "bg-exam-blue text-white hover:bg-blue-800"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }
                  `}
                >
                  Volgende
                </button>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Submit confirmation dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 max-w-sm mx-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Weet u het zeker?
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              U heeft <span className="font-semibold text-exam-warning">{unansweredCount}</span> van de {totalQuestions} vragen nog niet beantwoord.
              Wilt u toch inleveren?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Terug
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-exam-danger text-white hover:bg-red-700 transition-colors"
              >
                Toch inleveren
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quit confirmation dialog */}
      {showQuitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 max-w-sm mx-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Weet u het zeker?
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Uw voortgang gaat verloren. U heeft {answeredCount} van de {totalQuestions} vragen beantwoord.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowQuitConfirm(false)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Doorgaan
              </button>
              <button
                type="button"
                onClick={handleQuit}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-exam-danger text-white hover:bg-red-700 transition-colors"
              >
                Stoppen
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
