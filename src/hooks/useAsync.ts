import { useCallback, useEffect, useState, type DependencyList } from 'react';
import { ApiError } from '../api/client';

interface AsyncState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  reload: () => void;
  setData: (value: T) => void;
}

/** Carga datos con cancelación al desmontar y un `reload()` manual. */
export function useAsync<T>(
  run: (signal: AbortSignal) => Promise<T>,
  deps: DependencyList = [],
): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    let alive = true;

    setLoading(true);
    setError(null);

    run(controller.signal)
      .then((result) => {
        if (!alive) return;
        setData(result);
      })
      .catch((err: unknown) => {
        if (!alive || (err as Error)?.name === 'AbortError') return;
        setError(err instanceof ApiError ? err.message : 'No se pudieron cargar los datos.');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  return { data, error, loading, reload, setData };
}
