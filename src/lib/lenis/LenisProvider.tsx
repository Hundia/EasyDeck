"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type Lenis from "lenis";
import { destroyLenis, initLenis, type LenisOptions } from "./initLenis";

export interface LenisContextValue {
  lenis: Lenis | null;
  stop: () => void;
  start: () => void;
}

const LenisContext = createContext<LenisContextValue>({
  lenis: null,
  stop: () => {},
  start: () => {},
});

export interface LenisProviderProps {
  children: ReactNode;
  options?: LenisOptions;
}

export function LenisProvider({ children, options }: LenisProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const instance = initLenis(options);
    lenisRef.current = instance;
    setLenis(instance);

    return () => {
      destroyLenis(instance);
      lenisRef.current = null;
      setLenis(null);
    };
  }, []);

  const stop = useCallback(() => {
    lenisRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    lenisRef.current?.start();
  }, []);

  return <LenisContext.Provider value={{ lenis, stop, start }}>{children}</LenisContext.Provider>;
}

export function useLenis(): LenisContextValue {
  return useContext(LenisContext);
}
