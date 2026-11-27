import * as React from 'react';
import { Switch } from '@patternfly/react-core';
import { useClusterWizardContext } from '../../clusterWizardContext';

export const InstallDisconnectedSwitch = () => {
  const { installDisconnected, setInstallDisconnected } = useClusterWizardContext();

  return (
    <Switch
      id="disconnected-install-switch"
      isChecked={installDisconnected}
      onChange={(_, checked) => setInstallDisconnected(checked)}
      ouiaId="DisconnectedInstall"
      label={"I'm installing on a disconnected/air-gapped/secured environment"}
    />
  );
};
