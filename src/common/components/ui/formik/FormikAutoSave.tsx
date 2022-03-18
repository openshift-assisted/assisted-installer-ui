import React from 'react';
import { shallowEqual } from 'react-redux';
import _ from 'lodash';
import { useFormikContext } from 'formik';

const FormikAutoSave: React.FC<{ debounce?: number }> = ({ debounce = 1000 }) => {
  const { values, isSubmitting, submitForm, touched } = useFormikContext();
  const prevValuesRef = React.useRef(values);
  const commitRef = React.useRef(_.debounce(submitForm, debounce));

  React.useEffect(() => {
    if (
      !shallowEqual(prevValuesRef.current, values) &&
      // in the past we used `dirty` prop instead of `touched`.
      // But it seems to be buggy as `dirty` is true even if `touched` is empty.
      Object.keys(touched).length &&
      !isSubmitting
    ) {
      commitRef.current();
    }
    if (!isSubmitting) {
      prevValuesRef.current = values;
    }
  }, [values, isSubmitting, touched]);

  React.useEffect(() => {
    const commit = commitRef.current;
    return () => commit.cancel();
  }, []);

  return null;
};

export default FormikAutoSave;
