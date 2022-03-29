import React from 'react';
import { getAssistedUiLibVersion } from '../../config';

const AssistedUILibVersion: React.FC = ({ children }) => (
  <>
    {children}
    <div data-testid="assisted-ui-lib-version" hidden>
      {getAssistedUiLibVersion()}
    </div>
  </>
);

export default AssistedUILibVersion;
