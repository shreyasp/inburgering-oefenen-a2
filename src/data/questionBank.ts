import { load as yamlLoad } from "js-yaml";
import type { BankEntry } from "./types";

let bank: BankEntry[] = [];
let loaded = false;

const HISTORY_KEY = "inburgering-question-history";

interface QuestionRecord {
  correct: boolean;
  timestamp: number;
}

function loadHistory(): Record<string, QuestionRecord> {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveHistory(h: Record<string, QuestionRecord>): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
  } catch { /* quota */ }
}

export function recordAttempt(questionKey: string, wasCorrect: boolean): void {
  const h = loadHistory();
  h[questionKey] = { correct: wasCorrect, timestamp: Date.now() };
  saveHistory(h);
}

export function getQuestionRecord(key: string): QuestionRecord | undefined {
  return loadHistory()[key];
}

function isEntryMastered(entry: BankEntry): boolean {
  const history = loadHistory();
  return entry.questions.every((_, qIdx) => history[`${entry.id}:${qIdx}`]?.correct === true);
}

export function loadQuestionBank(): void {
  if (loaded) return;

  const modules = import.meta.glob("./questions-batch-*.yaml", {
    query: "?raw",
    import: "default",
    eager: true,
  });

  for (const path of Object.keys(modules).sort()) {
    const raw = modules[path] as string;
    const parsed = yamlLoad(raw) as BankEntry[];
    bank.push(...parsed);
  }

  loaded = true;
}

function pickRandom(pool: BankEntry[], excludeIds: Set<number>): BankEntry | null {
  const available = pool.filter((q) => !excludeIds.has(q.id));
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

function pickSmart(pool: BankEntry[], excludeIds: Set<number>): BankEntry | null {
  const candidates = pool.filter((q) => {
    if (excludeIds.has(q.id)) return false;
    return !isEntryMastered(q);
  });
  if (candidates.length > 0) {
    return candidates[Math.floor(Math.random() * candidates.length)];
  }
  return pickRandom(pool, excludeIds);
}

export function getTableEntries(): BankEntry[] {
  if (!loaded) loadQuestionBank();
  return bank.filter((q) => q.table);
}

export function getNonTableEntries(): BankEntry[] {
  if (!loaded) loadQuestionBank();
  return bank.filter((q) => !q.table);
}

export function pickTableQuestion(excludeIds: Set<number>): BankEntry | null {
  return pickSmart(getTableEntries(), excludeIds);
}

export function pickNonTableQuestion(excludeIds: Set<number>): BankEntry | null {
  return pickSmart(getNonTableEntries(), excludeIds);
}

export function pickAnyQuestion(excludeIds: Set<number>): BankEntry | null {
  return pickSmart(bank, excludeIds);
}

function countQuestions(entries: BankEntry[]): number {
  return entries.reduce((sum, e) => sum + e.questions.length, 0);
}

export function getBankSize(): number {
  if (!loaded) loadQuestionBank();
  return countQuestions(bank);
}

export function getTableCount(): number {
  return countQuestions(getTableEntries());
}

export function getQuestionById(id: number): BankEntry | undefined {
  if (!loaded) loadQuestionBank();
  return bank.find((q) => q.id === id);
}

export function isAllMastered(): boolean {
  if (!loaded) loadQuestionBank();
  if (bank.length === 0) return false;
  const history = loadHistory();
  return bank.every((entry) =>
    entry.questions.every((_, qIdx) => history[`${entry.id}:${qIdx}`]?.correct === true),
  );
}

export { type BankEntry, type BankQuestion, type TableData } from "./types";