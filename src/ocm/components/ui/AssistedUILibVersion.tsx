import React, { useEffect } from 'react';
import { getAssistedUiLibVersion } from '../../../common';

const version = getAssistedUiLibVersion();

export const AssistedUILibVersion: React.FC = () => {
  useEffect(() => {
    console.log(`openshift-assisted-ui-lib v${version}`);
  }, []);

  return (
    <div data-testid="assisted-ui-lib-version" hidden>
      {version}
    </div>
  );
};
