import * as React from 'react';
import { Switch, Tooltip } from '@patternfly/react-core';
import { useClusterWizardContext } from '../ClusterWizardContext';
import { useTranslation } from '@openshift-assisted/common';

const InstallDisconnectedSwitch = ({ isDisabled }: { isDisabled?: boolean }) => {
  const { t } = useTranslation();
  const { installDisconnected, setInstallDisconnected } = useClusterWizardContext();

  const switchBtn = (
    <Switch
      id="disconnected-install-switch"
      isChecked={installDisconnected}
      onChange={(_, checked) => setInstallDisconnected(checked)}
      ouiaId="DisconnectedInstall"
      isDisabled={isDisabled}
    />
  );

  return isDisabled ? (
    <Tooltip
      content={<div>{t('ai:This option is not editable after the draft cluster is created')}</div>}
    >
      {switchBtn}
    </Tooltip>
  ) : (
    switchBtn
  );
};

export default InstallDisconnectedSwitch;
