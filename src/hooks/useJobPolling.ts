import { useEffect, useRef, useState } from 'react';
import { ApiError, jobs as jobsApi } from '../api/client';
import { isJobFinished, type Job } from '../api/types';

/** Rápido al principio y más espaciado después, para no castigar a Nexus. */
const FAST_INTERVAL_MS = 2000;
const SLOW_INTERVAL_MS = 5000;
const SWITCH_AFTER_MS = 30_000;
const TIMEOUT_MS = 5 * 60_000;

interface PollingState {
  job: Job | null;
  error: string | null;
  isPolling: boolean;
  timedOut: boolean;
}

/**
 * La generación es asíncrona: se crea el trabajo y aquí se consulta su estado
 * hasta que termina (publicado / listo / error), se agota el tiempo o se
 * desmonta el componente.
 */
export function useJobPolling(
  jobId: string | null,
  onFinished?: (job: Job) => void,
): PollingState {
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const finishedRef = useRef(onFinished);

  useEffect(() => {
    finishedRef.current = onFinished;
  }, [onFinished]);

  useEffect(() => {
    if (!jobId) {
      setJob(null);
      setError(null);
      setIsPolling(false);
      setTimedOut(false);
      return;
    }

    const controller = new AbortController();
    const startedAt = Date.now();
    let alive = true;
    let timer: number | undefined;

    setIsPolling(true);
    setTimedOut(false);
    setError(null);

    async function tick() {
      if (!alive || !jobId) return;

      try {
        const next = await jobsApi.get(jobId, controller.signal);
        if (!alive) return;
        setJob(next);

        if (isJobFinished(next.status)) {
          setIsPolling(false);
          finishedRef.current?.(next);
          return;
        }
      } catch (err) {
        if (!alive || (err as Error)?.name === 'AbortError') return;
        // Un fallo suelto no corta el polling; sí lo hace un 401/404.
        const apiError = err as ApiError;
        if (apiError instanceof ApiError && [401, 403, 404].includes(apiError.status)) {
          setError(apiError.message);
          setIsPolling(false);
          return;
        }
        setError('Perdimos contacto con el servidor. Reintentando…');
      }

      if (Date.now() - startedAt > TIMEOUT_MS) {
        setIsPolling(false);
        setTimedOut(true);
        return;
      }

      const interval =
        Date.now() - startedAt > SWITCH_AFTER_MS ? SLOW_INTERVAL_MS : FAST_INTERVAL_MS;
      timer = window.setTimeout(tick, interval);
    }

    tick();

    return () => {
      alive = false;
      controller.abort();
      if (timer) window.clearTimeout(timer);
    };
  }, [jobId]);

  return { job, error, isPolling, timedOut };
}
