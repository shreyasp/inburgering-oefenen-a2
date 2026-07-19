interface TimerProps {
  minutes: number;
  seconds: number;
  isWarning: boolean;
  isDanger: boolean;
}

export function Timer({ minutes, seconds, isWarning, isDanger }: TimerProps) {
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");

  let colorClass = "text-gray-700";
  if (isDanger) colorClass = "text-exam-danger";
  else if (isWarning) colorClass = "text-exam-warning";

  return (
    <span className={`font-timer text-lg font-semibold ${colorClass}`}>
      {mm}:{ss}
    </span>
  );
}
