import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function useStateSafely<S>(initialState: S): [S, Dispatch<SetStateAction<S>>] {
  const mountedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const [state, setState] = useState(initialState);
  const setStateSafely: Dispatch<SetStateAction<S>> = useCallback((arg) => {
    if (mountedRef.current) {
      setState(arg);
    }
  }, []);

  return [state, setStateSafely];
}
