import React from 'react';
import { Stack, StackItem } from '@patternfly/react-core';
import { ClusterWizardStep, ClusterWizardStepHeader, DownloadIso, isSNO } from '../../../../common';
import { useModalDialogsContext } from '../../hosts/ModalDialogsContext';
import { useDay2WizardContext } from './Day2WizardContext';
import Day2WizardNav from './Day2WizardNav';
import DownloadIpxeScript from '../../../../common/components/clusterConfiguration/DownloadIpxeScript';

const Day2DownloadISO = () => {
  const { day2DiscoveryImageDialog } = useModalDialogsContext();
  const { close, data } = day2DiscoveryImageDialog;
  const cluster = data.cluster;
  const wizardContext = useDay2WizardContext();
  const isoDownloadUrl = wizardContext.selectedIsoUrl;
  const ipxeDownloadUrl = wizardContext.selectedIpxeUrl;
  const nameImageSuffix = `${cluster.name || ''}_${wizardContext.selectedCpuArchitecture}`;
  return (
    <ClusterWizardStep navigation={<Day2WizardNav />}>
      <Stack hasGutter>
        <StackItem>
          <ClusterWizardStepHeader>Download Discovery ISO</ClusterWizardStepHeader>
        </StackItem>
        <StackItem>
          {isoDownloadUrl && (
            <DownloadIso
              fileName={`discovery_image_${nameImageSuffix}.iso`}
              downloadUrl={isoDownloadUrl}
              isSNO={isSNO(cluster)}
              onReset={() => wizardContext.moveBack()}
              onClose={close}
            />
          )}
          {ipxeDownloadUrl && (
            <DownloadIpxeScript
              fileName={`discovery_ipxe_script_${nameImageSuffix}.txt`}
              downloadUrl={ipxeDownloadUrl}
              isSNO={isSNO(cluster)}
              onReset={() => wizardContext.moveBack()}
              onClose={close}
            />
          )}
        </StackItem>
      </Stack>
    </ClusterWizardStep>
  );
};

export default Day2DownloadISO;
