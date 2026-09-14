import { useEffect, useState } from "react";
import { initialState, STORAGE_KEY, type UniCaronaState } from "@/lib/unicarona-data";

export function useUniCarona() {
  const [state, setState] = useState<UniCaronaState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setState(JSON.parse(saved) as UniCaronaState);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    document.documentElement.classList.toggle("dark", state.theme === "dark");
  }, [state, hydrated]);

  const update = (recipe: (current: UniCaronaState) => UniCaronaState) => setState(recipe);
  const reset = () => setState(initialState);
  return { state, update, reset, hydrated };
}