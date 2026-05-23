import { useEffect, useState } from "react";

/**
 * Returns appropriate gesture tolerance based on input type.
 * Coarse pointer (touch) = 20px, fine pointer (mouse) = 10px.
 */
export function useTouchTolerance(): number {
  const [tolerance, setTolerance] = useState(10);

  useEffect(() => {
    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    setTolerance(isCoarse ? 20 : 10);
  }, []);

  return tolerance;
}
