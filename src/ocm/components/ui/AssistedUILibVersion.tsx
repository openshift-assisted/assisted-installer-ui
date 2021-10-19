import React from 'react';
import { useLogAssistedInstallerUILibVersion } from '../../../common';

export const AssistedUILibVersion: React.FC = () => {
  const version = useLogAssistedInstallerUILibVersion();

  return (
    <div data-testid="assisted-ui-lib-version" hidden>
      {version}
    </div>
  );
};
