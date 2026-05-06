import * as React from 'react';
import { Switch, Tooltip } from '@patternfly/react-core';
import { useClusterWizardContext } from '../ClusterWizardContext';
import { handleApiError, getApiErrorMessage, useTranslation, useAlerts } from '../../../../common';
import ClustersService from '../../../services/ClustersService';

const InstallDisconnectedSwitch = ({
  isDisabled,
  disconnectedClusterId,
}: {
  isDisabled?: boolean;
  disconnectedClusterId?: string;
}) => {
  const { t } = useTranslation();
  const { installDisconnected, setInstallDisconnected, setDisconnectedInfraEnv } =
    useClusterWizardContext();
  const { addAlert } = useAlerts();

  const handleChange = async (checked: boolean) => {
    setInstallDisconnected(checked);
    if (disconnectedClusterId) {
      try {
        await ClustersService.remove(disconnectedClusterId);
      } catch (e) {
        handleApiError(e, () =>
          addAlert({
            title: 'Failed to remove cluster',
            message: getApiErrorMessage(e),
          }),
        );
      }
      setDisconnectedInfraEnv(undefined);
    }
  };

  const switchBtn = (
    <Switch
      id="disconnected-install-switch"
      isChecked={installDisconnected}
      onChange={(_, checked) => {
        void handleChange(checked);
      }}
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
