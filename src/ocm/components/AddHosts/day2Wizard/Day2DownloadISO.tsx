import React from 'react';
import { Stack, StackItem } from '@patternfly/react-core';
import { ClusterWizardStep, ClusterWizardStepHeader, isSNO } from '../../../../common';
import { useModalDialogsContext } from '../../hosts/ModalDialogsContext';
import { useDay2WizardContext } from './Day2WizardContext';
import Day2WizardNav from './Day2WizardNav';
import DiscoveryImageSummary from '../../clusterConfiguration/DiscoveryImageSummary';

const Day2DownloadISO = () => {
  const { day2DiscoveryImageDialog } = useModalDialogsContext();
  const { close, data } = day2DiscoveryImageDialog;
  const cluster = data.cluster;
  const wizardContext = useDay2WizardContext();

  return (
    <ClusterWizardStep navigation={<Day2WizardNav />}>
      <Stack hasGutter>
        <StackItem>
          <ClusterWizardStepHeader>Download Discovery ISO</ClusterWizardStepHeader>
        </StackItem>
        <StackItem>
          <DiscoveryImageSummary
            onClose={close}
            onReset={() => wizardContext.moveBack()}
            clusterName={cluster?.name || 'cluster'}
            isSNO={isSNO(cluster)}
            isoDownloadUrl={wizardContext.selectedIsoUrl}
            cpuArchitecture={wizardContext.selectedCpuArchitecture}
          />
        </StackItem>
      </Stack>
    </ClusterWizardStep>
  );
};

export default Day2DownloadISO;
