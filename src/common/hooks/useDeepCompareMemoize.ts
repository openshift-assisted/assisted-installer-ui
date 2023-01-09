import * as React from 'react';
import isEqual from 'lodash/isEqual';

const useDeepCompareMemoize = <T>(value: T): T => {
  const ref = React.useRef<T>(value);

  if (!isEqual(value, ref.current)) {
    ref.current = value;
  }

  return ref.current;
};

export default useDeepCompareMemoize;
