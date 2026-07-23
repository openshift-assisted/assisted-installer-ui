import React from 'react';
import { Provider } from 'react-redux';
import { AlertsContextProvider } from '../../../common';
import { storeDay1 } from '../../store';
import { AssistedInstallerDetailCardContent } from './AssistedInstallerDetailCardContents';
import { AssistedInstallerDetailCardProps } from './types';

export const AssistedInstallerDetailCard = (props: AssistedInstallerDetailCardProps) => (
  <Provider store={storeDay1}>
    <AlertsContextProvider>
      <AssistedInstallerDetailCardContent {...props} />
    </AlertsContextProvider>
  </Provider>
);
