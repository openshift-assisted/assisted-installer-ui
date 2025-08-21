import * as React from 'react';
import { Switch, Tooltip } from '@patternfly/react-core';
import { useClusterWizardContext } from '../ClusterWizardContext';
import { useTranslation } from '../../../../common';

const InstallDisconnectedSwitch = ({ isDisabled }: { isDisabled?: boolean }) => {
  const { t } = useTranslation();
  const { installDisconnected, setInstallDisconnected } = useClusterWizardContext();

  const switchBtn = (
    <Switch
      id="disconnected-install-switch"
      label={t("ai:I'm installing on a disconnected/air-gapped/secured environment")}
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
