import * as React from 'react';
import { useFormikContext } from 'formik';
import { EnvironmentStepFormValues } from '../types';
import EnvironmentDetails from '../../EnvironmentDetails';

type ReviewStepProps = {
  created: boolean;
  error: string | undefined;
};

const ReviewStep: React.FC<ReviewStepProps> = ({ created, error }) => {
  const { values, isSubmitting } = useFormikContext<EnvironmentStepFormValues>();
  const createStatus = error ? 'Error' : isSubmitting ? 'Loading' : created ? 'Done!' : false;
  return (
    <>
      <EnvironmentDetails title="Review and create" {...values} />
      <div>{createStatus}</div>
    </>
  );
};

export default ReviewStep;
