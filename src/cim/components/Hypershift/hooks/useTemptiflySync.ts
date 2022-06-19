import * as React from 'react';

type UseTemptiflySyncArgs<V> = {
  values: V;
  onValuesChanged: (values: V, initRender: boolean) => void;
};

export const useTemptiflySync = <V>({ values, onValuesChanged }: UseTemptiflySyncArgs<V>) => {
  const initRenderRef = React.useRef(true);
  React.useEffect(() => onValuesChanged(values, initRenderRef.current), [onValuesChanged, values]);
  React.useEffect(() => {
    initRenderRef.current = false;
  }, []);

  const nameInputRef = React.useRef<HTMLInputElement>();
  React.useEffect(() => {
    nameInputRef.current?.focus();
  }, []);
};
