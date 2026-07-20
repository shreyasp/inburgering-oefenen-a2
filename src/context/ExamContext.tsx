import {
  createContext,
  useCallback,
  useContext,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";

interface ExamState {
  sessionId: string | null;
  currentQuestionIndex: number;
  answers: Record<string, string>;
  bookmarks: string[];
  askedQuestionIds: number[];
  status: "idle" | "in-progress" | "submitted";
  startTime: number | null;
  endTime: number | null;
}

type ExamAction =
  | { type: "START_TEST" }
  | { type: "ANSWER_QUESTION"; questionId: string; answer: string }
  | { type: "TOGGLE_BOOKMARK"; questionId: string }
  | { type: "GO_TO_QUESTION"; index: number }
  | { type: "NEXT_QUESTION" }
  | { type: "SUBMIT" }
  | { type: "ADD_QUESTION"; questionId: number }
  | { type: "RESET" };

const initialState: ExamState = {
  sessionId: null,
  currentQuestionIndex: 0,
  answers: {},
  bookmarks: [],
  askedQuestionIds: [],
  status: "idle",
  startTime: null,
  endTime: null,
};

const STORAGE_KEY = "inburgering-exam-state";
const HISTORY_KEY = "inburgering-exam-history";

function loadState(): ExamState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...initialState, ...parsed };
    }
  } catch {
    // corrupted state, ignore
  }
  return initialState;
}

function saveState(state: ExamState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // quota exceeded, ignore
  }
}

export interface AttemptRecord {
  score: number;
  totalQuestions: number;
  timestamp: number;
  timeTaken: number;
}

export function getAttemptHistory(): AttemptRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch { /* corrupted */ }
  return [];
}

export function saveAttemptHistory(record: AttemptRecord): void {
  try {
    const history = getAttemptHistory();
    history.push(record);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch { /* quota */ }
}

export function getSessionStats(): { attempts: number; avgScore: number; questions: number } {
  const today = new Date().toDateString();
  const attempts = getAttemptHistory().filter(
    (a) => new Date(a.timestamp).toDateString() === today,
  );
  if (attempts.length === 0) return { attempts: 0, avgScore: 0, questions: 0 };
  const totalScore = attempts.reduce((s, a) => s + a.score, 0);
  const totalQ = attempts.reduce((s, a) => s + a.totalQuestions, 0);
  return {
    attempts: attempts.length,
    avgScore: Math.round((totalScore / totalQ) * 100),
    questions: totalQ,
  };
}

export function getLifetimeStats(): { attempts: number; avgScore: number; questions: number } {
  const attempts = getAttemptHistory();
  if (attempts.length === 0) return { attempts: 0, avgScore: 0, questions: 0 };
  const totalScore = attempts.reduce((s, a) => s + a.score, 0);
  const totalQ = attempts.reduce((s, a) => s + a.totalQuestions, 0);
  return {
    attempts: attempts.length,
    avgScore: Math.round((totalScore / totalQ) * 100),
    questions: totalQ,
  };
}

export function clearAllHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
  localStorage.removeItem("inburgering-question-history");
}

function reducer(state: ExamState, action: ExamAction): ExamState {
  switch (action.type) {
    case "START_TEST": {
      const next: ExamState = {
        ...state,
        sessionId: crypto.randomUUID(),
        currentQuestionIndex: 0,
        answers: {},
        bookmarks: [],
        askedQuestionIds: [],
        status: "in-progress",
        startTime: Date.now(),
        endTime: null,
      };
      saveState(next);
      return next;
    }
    case "ANSWER_QUESTION": {
      const next: ExamState = {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.answer },
      };
      saveState(next);
      return next;
    }
    case "TOGGLE_BOOKMARK": {
      const exists = state.bookmarks.includes(action.questionId);
      const next: ExamState = {
        ...state,
        bookmarks: exists
          ? state.bookmarks.filter((id) => id !== action.questionId)
          : [...state.bookmarks, action.questionId],
      };
      saveState(next);
      return next;
    }
    case "GO_TO_QUESTION": {
      const next = { ...state, currentQuestionIndex: action.index };
      saveState(next);
      return next;
    }
    case "NEXT_QUESTION": {
      const next = {
        ...state,
        currentQuestionIndex: state.currentQuestionIndex + 1,
      };
      saveState(next);
      return next;
    }
    case "ADD_QUESTION": {
      const next: ExamState = {
        ...state,
        askedQuestionIds: [...state.askedQuestionIds, action.questionId],
      };
      saveState(next);
      return next;
    }
    case "SUBMIT": {
      const next: ExamState = {
        ...state,
        status: "submitted",
        endTime: Date.now(),
      };
      saveState(next);
      return next;
    }
    case "RESET": {
      localStorage.removeItem(STORAGE_KEY);
      return initialState;
    }
    default:
      return state;
  }
}

const ExamContext = createContext<{
  state: ExamState;
  dispatch: Dispatch<ExamAction>;
} | null>(null);

export function ExamProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, null, loadState);

  return (
    <ExamContext.Provider value={{ state, dispatch }}>
      {children}
    </ExamContext.Provider>
  );
}

export function useExam() {
  const ctx = useContext(ExamContext);
  if (!ctx) throw new Error("useExam must be inside ExamProvider");
  return ctx;
}

export function useExamActions() {
  const { state, dispatch } = useExam();

  const startTest = useCallback(
    () => dispatch({ type: "START_TEST" }),
    [dispatch],
  );
  const answerQuestion = useCallback(
    (questionId: string, answer: string) =>
      dispatch({ type: "ANSWER_QUESTION", questionId, answer }),
    [dispatch],
  );
  const toggleBookmark = useCallback(
    (questionId: string) =>
      dispatch({ type: "TOGGLE_BOOKMARK", questionId }),
    [dispatch],
  );
  const goToQuestion = useCallback(
    (index: number) => dispatch({ type: "GO_TO_QUESTION", index }),
    [dispatch],
  );
  const nextQuestion = useCallback(
    () => dispatch({ type: "NEXT_QUESTION" }),
    [dispatch],
  );
  const submit = useCallback(
    () => dispatch({ type: "SUBMIT" }),
    [dispatch],
  );
  const reset = useCallback(
    () => dispatch({ type: "RESET" }),
    [dispatch],
  );
  const addQuestion = useCallback(
    (questionId: number) => dispatch({ type: "ADD_QUESTION", questionId }),
    [dispatch],
  );

  return {
    state,
    startTest,
    answerQuestion,
    toggleBookmark,
    goToQuestion,
    nextQuestion,
    submit,
    reset,
    addQuestion,
  };
}
