import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadQuestionBank, getBankSize, getTableCount, isAllMastered } from "../data";
import { getSessionStats, getLifetimeStats, clearAllHistory } from "../context/ExamContext";
import { useCallback } from "react";

export function HomePage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    loadQuestionBank();
    setReady(true);
  }, []);

  const allMastered = isAllMastered();
  const session = getSessionStats();
  const lifetime = getLifetimeStats();

  return (
    <main className="min-h-screen bg-exam-bg">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Inburgering Leestoets
          </h1>
          <p className="text-lg text-gray-600">
            Oefen leesvaardigheid op A2-niveau
          </p>
        </header>

        {ready && (
          <>
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex gap-6 mb-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{getBankSize()}</p>
                <p className="text-sm text-gray-500">vragen beschikbaar</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{getTableCount()}</p>
                <p className="text-sm text-gray-500">tabelvragen</p>
              </div>
            </div>

            {allMastered ? (
              <div className="bg-exam-success-light border border-exam-success rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700">
                  U heeft alle vragen goed beantwoord! Stuur nieuwe voorbeeldteksten om meer vragen toe te voegen.
                </p>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => navigate("/exam")}
              disabled={allMastered}
              className={`w-full py-3 rounded-lg text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-exam-blue focus:ring-offset-2 ${allMastered ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-exam-blue text-white hover:bg-blue-800"}`}
            >
              {lifetime.attempts > 0 ? "Opnieuw proberen" : "Start Oefentoets"}
            </button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Statistieken
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-xs font-medium text-gray-400 uppercase mb-2">Deze sessie</h3>
                {session.attempts === 0 ? (
                  <p className="text-sm text-gray-400">Nog geen toetsen vandaag</p>
                ) : (
                  <div className="space-y-1.5">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">{session.attempts}</span> toetsen
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">{session.questions}</span> vragen
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">{session.avgScore}%</span> gemiddeld
                    </p>
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-xs font-medium text-gray-400 uppercase mb-2">Altijd</h3>
                <div className="space-y-1.5">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">{lifetime.attempts}</span> toetsen
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">{lifetime.questions}</span> vragen
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">{lifetime.avgScore}%</span> gemiddeld
                  </p>
                </div>
              </div>
            </div>

            {lifetime.attempts > 0 && (
              <button
                type="button"
                onClick={() => { clearAllHistory(); refresh(); }}
                className="mt-4 text-xs text-gray-400 hover:text-exam-danger transition-colors"
              >
                Reset statistieken
              </button>
            )}
          </div>
          </>
        )}

        <footer className="mt-16 pt-6 border-t border-gray-200 text-center text-sm text-gray-400">
          Deze app simuleert het echte inburgeringsexamen.
        </footer>
      </div>
    </main>
  );
}
