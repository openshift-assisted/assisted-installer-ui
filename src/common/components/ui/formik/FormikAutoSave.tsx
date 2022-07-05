import React from 'react';
import { shallowEqual } from 'react-redux';
import debouncer from 'lodash/debounce';
import { useFormikContext } from 'formik';

type UseFormikAutoSave = (debounce?: number) => boolean;

export const useFormikAutoSave: UseFormikAutoSave = (debounce = 1000) => {
  const [autoSaveIDs, setAutoSaveIDs] = React.useState<number[]>([]);
  const { values, isSubmitting, submitForm } = useFormikContext();
  const prevValuesRef = React.useRef(values);
  const commitRef = React.useRef(
    debouncer(async (autoSaveID: number) => {
      await submitForm();
      setAutoSaveIDs((ids) => ids.filter((id) => id > autoSaveID));
    }, debounce),
  );

  React.useEffect(() => {
    if (!shallowEqual(prevValuesRef.current, values) && !isSubmitting) {
      const autoSaveID = Date.now();
      setAutoSaveIDs((ids) => {
        ids.push(autoSaveID);
        return ids;
      });
      void commitRef.current(autoSaveID);
    }
    if (!isSubmitting) {
      prevValuesRef.current = values;
    }
  }, [values, isSubmitting, setAutoSaveIDs]);

  React.useEffect(() => {
    const commit = commitRef.current;
    return () => commit.cancel();
  }, []);

  return !!autoSaveIDs.length;
};

const FormikAutoSave: React.FC<{ debounce?: number }> = ({ debounce = 1000 }) => {
  const { values, dirty, isSubmitting, submitForm } = useFormikContext();
  const prevValuesRef = React.useRef(values);
  const commitRef = React.useRef(debouncer(submitForm, debounce));

  React.useEffect(() => {
    if (!shallowEqual(prevValuesRef.current, values) && dirty && !isSubmitting) {
      void commitRef.current();
    }
    if (!isSubmitting) {
      prevValuesRef.current = values;
    }
  }, [values, dirty, isSubmitting]);

  React.useEffect(() => {
    const commit = commitRef.current;
    return () => commit.cancel();
  }, []);

  return null;
};

export default FormikAutoSave;
