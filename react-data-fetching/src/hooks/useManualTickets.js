import { useCallback, useEffect, useState } from 'react';
import { fetchTickets } from '../api/ticketsApi.js';

export function useManualTickets(failureMode) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const tickets = await fetchTickets({ failureMode });
      setData(tickets);
    } catch (requestError) {
      setError(requestError);
    } finally {
      setLoading(false);
    }
  }, [failureMode]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetchTickets({ failureMode })
      .then((tickets) => {
        if (active) setData(tickets);
      })
      .catch((requestError) => {
        if (active) setError(requestError);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [failureMode]);

  return { data, loading, error, refresh };
}
