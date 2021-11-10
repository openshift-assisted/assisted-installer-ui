import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';

export const useStateSafely = <S>(initialState: S): [S, Dispatch<SetStateAction<S>>] => {
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
};

export default useStateSafely;
