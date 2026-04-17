import { useEffect } from 'react';

export function useTournamentTimer(running, setSeconds) {
  useEffect(() => {
    if (!running) return undefined;

    const intervalId = window.setInterval(() => {
      setSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [running, setSeconds]);
}
