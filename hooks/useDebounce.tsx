"use client";

import { useCallback, useEffect, useRef } from "react";

function useDebounce(callback: () => void, delay = 400) {
  const timeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    };
  }, []);

  return useCallback(() => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }

    timeout.current = setTimeout(callback, delay);
  }, [callback, delay]);
}

export default useDebounce;
