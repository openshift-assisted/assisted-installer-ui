import * as React from 'react';
import {
  Alert,
  AlertVariant,
  Progress,
  ProgressMeasureLocation,
  Stack,
  StackItem,
} from '@patternfly/react-core';

type ModalProgressProps = {
  error?: {
    title: string;
    message: string;
  };
  progress: number | null;
};

const ModalProgress: React.FC<ModalProgressProps> = ({ error, progress }) => (
  <Stack hasGutter>
    {error && (
      <StackItem>
        <Alert variant={AlertVariant.danger} title={error.title} isInline>
          {error.message}
        </Alert>
      </StackItem>
    )}
    {progress !== null && (
      <StackItem>
        <Progress
          value={progress}
          measureLocation={ProgressMeasureLocation.outside}
          aria-label="Progress"
        />
      </StackItem>
    )}
  </Stack>
);

export default ModalProgress;
