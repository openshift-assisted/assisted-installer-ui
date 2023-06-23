import React from 'react';
import { Button } from '@patternfly/react-core';

interface TryAgainProps {
  onTryAgain: () => void;
}

const UnableToAddHostsError = ({ onTryAgain }: TryAgainProps) => {
  return (
    <>
      Temporarily unable to add hosts
      <br />
      We're waiting for your recently installed cluster to report its metrics.{' '}
      <Button variant={'link'} isInline onClick={onTryAgain}>
        Try again
      </Button>{' '}
      in a few minutes.
    </>
  );
};

const UnsupportedVersion = ({ version, onTryAgain }: { version: string } & TryAgainProps) => {
  return (
    <>
      Unsupported OpenShift cluster version: {version || 'N/A'}.
      <br />
      Check your connection and{' '}
      <Button variant={'link'} isInline onClick={onTryAgain}>
        try again
      </Button>
      .
    </>
  );
};

const ReloadFailed = ({ onTryAgain }: TryAgainProps) => {
  return (
    <>
      Failed to reload cluster data.
      <br />
      Check your connection and{' '}
      <Button variant={'link'} isInline onClick={onTryAgain}>
        try again
      </Button>
      .
    </>
  );
};

const AddHostsApiError = ({ isImport, onTryAgain }: { isImport: boolean } & TryAgainProps) => {
  return (
    <>
      {isImport
        ? 'Failed to create wrapping cluster for adding new hosts.'
        : 'Failed to fetch cluster for adding new hosts.'}
      <br />
      Check your connection and{' '}
      <Button variant={'link'} isInline onClick={onTryAgain}>
        try again
      </Button>
      .
    </>
  );
};

export { AddHostsApiError, UnsupportedVersion, UnableToAddHostsError, ReloadFailed };
