import { useState, useCallback } from "react";

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: () => Promise<void>;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}

export function useApi<T>(
  apiCall: () => Promise<{ success?: boolean; data?: T; error?: string }>,
  errorMessage: string = "Unable to fetch data"
): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await apiCall();
      if (response.data) {
        setData(response.data);
      } else {
        setError(response.error || errorMessage);
      }
    } catch (err) {
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [apiCall, errorMessage]);

  return { data, isLoading, error, execute, setData };
}
