import { useEffect, useState } from "react";

// Verzögert einen sich ändernden Wert (z. B. Sucheingabe), um API-Spam zu vermeiden.
export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
