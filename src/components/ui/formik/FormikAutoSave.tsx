import React from 'react';
import { shallowEqual } from 'react-redux';
import _ from 'lodash';
import { useFormikContext } from 'formik';
import usePrevious from 'use-previous';

const FormikAutoSave: React.FC<{ debounce?: number }> = ({ debounce = 1000 }) => {
  const { values, dirty, submitForm } = useFormikContext();
  const prevValues = usePrevious(values);
  const commitRef = React.useRef(_.debounce(submitForm, debounce));

  React.useEffect(() => {
    if (!shallowEqual(prevValues, values) && dirty) {
      commitRef.current();
    }
  }, [values, dirty, prevValues]);

  React.useEffect(() => {
    const commit = commitRef.current;
    return () => commit.cancel();
  }, []);

  return null;
};

export default FormikAutoSave;
