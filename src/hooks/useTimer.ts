import { useCallback, useEffect, useRef, useState } from "react";

interface TimerResult {
  minutes: number;
  seconds: number;
  isExpired: boolean;
  isWarning: boolean;
  isDanger: boolean;
  reset: () => void;
}

export function useTimer(
  totalSeconds: number,
  onExpire: () => void,
): TimerResult {
  const [remaining, setRemaining] = useState(totalSeconds);
  const expireCalled = useRef(false);
  const startTimeRef = useRef(Date.now());

  const reset = useCallback(() => {
    setRemaining(totalSeconds);
    expireCalled.current = false;
    startTimeRef.current = Date.now();
  }, [totalSeconds]);

  useEffect(() => {
    if (remaining <= 0) {
      if (!expireCalled.current) {
        expireCalled.current = true;
        onExpire();
      }
      return;
    }

    const now = Date.now();
    const elapsed = Math.floor((now - startTimeRef.current) / 1000);
    const nextTick = 1000 - ((now - startTimeRef.current) % 1000);

    const timeout = setTimeout(() => {
      setRemaining(totalSeconds - elapsed - 1);
    }, Math.max(nextTick, 100));

    return () => clearTimeout(timeout);
  }, [remaining, totalSeconds, onExpire]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const isExpired = remaining <= 0;
  const isWarning = remaining <= 600 && remaining > 300;
  const isDanger = remaining <= 300;

  return { minutes, seconds, isExpired, isWarning, isDanger, reset };
}
