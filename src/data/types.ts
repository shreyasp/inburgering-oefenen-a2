export interface Question {
  id: number;
  text: string;
  options: { label: string; text: string }[];
  correctAnswer: string;
}

export interface ReadingText {
  id: number;
  title: string;
  content: string;
  questions: Question[];
}

export interface Test {
  id: string;
  title: string;
  description: string;
  texts: ReadingText[];
}

export type AttemptRecord = {
  score: number;
  totalQuestions: number;
  timestamp: number;
  timeTaken: number;
};

// ── YAML question bank types ──

export interface TableData {
  headers: string[];
  rows: string[][];
}

export interface BankQuestion {
  questiontext: string;
  options: { label: string; text: string }[];
  correct_answer: string;
}

export interface BankEntry {
  id: number;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  text: string;
  table?: TableData;
  questions: BankQuestion[];
}
