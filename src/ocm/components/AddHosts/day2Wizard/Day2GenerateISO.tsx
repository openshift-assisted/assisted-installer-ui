import React from 'react';
import { ClusterWizardStep } from '../../../../common';
import DiscoveryImageForm from '../../clusterConfiguration/DiscoveryImageForm';
import { useModalDialogsContext } from '../../hosts/ModalDialogsContext';
import { useDay2WizardContext } from './Day2WizardContext';
import { Day2WizardNav } from './Day2WizardNav';
import useInfraEnvImageUrl from '../../../hooks/useInfraEnvImageUrl';

export const Day2GenerateISO = () => {
  const { day2DiscoveryImageDialog } = useModalDialogsContext();
  const { close, data } = day2DiscoveryImageDialog;
  const cluster = data.cluster;
  const wizardContext = useDay2WizardContext();
  const { getIsoImageUrl } = useInfraEnvImageUrl();

  const onImageReady = React.useCallback(async () => {
    const isoUrl = await getIsoImageUrl(cluster.id, wizardContext.selectedCpuArchitecture);
    if (!isoUrl.error) {
      wizardContext.setSelectedIsoUrl(isoUrl.url);
      wizardContext.moveNext();
    }
  }, [cluster?.id, wizardContext, getIsoImageUrl]);

  return (
    <ClusterWizardStep navigation={<Day2WizardNav />}>
      <DiscoveryImageForm
        cluster={cluster}
        cpuArchitecture={wizardContext.selectedCpuArchitecture}
        onCancel={close}
        onSuccess={onImageReady}
      />
    </ClusterWizardStep>
  );
};
