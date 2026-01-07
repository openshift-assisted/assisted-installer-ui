import React from 'react';
import { getAssistedUiLibVersion } from '../../../common';

export const AssistedUILibVersion: React.FC<React.PropsWithChildren> = ({ children }) => (
  <>
    {children}
    <div data-testid="assisted-ui-lib-version" hidden>
      {getAssistedUiLibVersion()}
    </div>
  </>
);
