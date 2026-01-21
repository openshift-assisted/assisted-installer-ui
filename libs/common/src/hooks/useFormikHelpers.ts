import { useField } from 'formik';
import * as React from 'react';

// workaround for https://github.com/jaredpalmer/formik/issues/2268
// formik helpers are new a instance on every formik store update :(
export const useFormikHelpers = <R>(fieldID: string) => {
  const [{ value }, , { setValue, setTouched }] = useField<R>(fieldID);

  const idsRef = React.useRef(value);
  idsRef.current = value;

  const setValueRef = React.useRef(setValue);
  setValueRef.current = setValue;
  const setTouchedRef = React.useRef(setTouched);
  setTouchedRef.current = setTouched;

  const setFieldValue = React.useCallback((value: R, shouldValidate?: boolean) => {
    setValueRef.current(value, shouldValidate);
  }, []);

  const setFieldTouched = React.useCallback(
    (touched: boolean, shouldValidate?: boolean) => setTouchedRef.current(touched, shouldValidate),
    [],
  );

  const valueRef = React.useRef<R>(value);
  valueRef.current = value;

  return { setValue: setFieldValue, setTouched: setFieldTouched, valueRef };
};
