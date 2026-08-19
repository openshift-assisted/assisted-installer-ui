import * as React from 'react';
import { Switch, Tooltip } from '@patternfly/react-core';
import { TechnologyPreview, useTranslation } from '../../../../../common';
import { useClusterWizardContext } from '../../clusterWizardContext';

export const InstallDisconnectedSwitch = ({ isDisabled }: { isDisabled?: boolean }) => {
  const { t } = useTranslation();
  const { installDisconnected, setInstallDisconnected } = useClusterWizardContext();

  const switchBtn = (
    <>
      <Switch
        id="disconnected-install-switch"
        isChecked={installDisconnected}
        onChange={(_, checked) => setInstallDisconnected(checked)}
        ouiaId="DisconnectedInstall"
        isDisabled={isDisabled}
        label={<>{"I'm installing on a disconnected/air-gapped/secured environment"}</>}
      />
      <TechnologyPreview />
    </>
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
