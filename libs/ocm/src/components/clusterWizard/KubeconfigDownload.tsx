import React from 'react';
import { ClusterWizardStep, ClusterWizardStepHeader } from '@openshift-assisted/common';
import { useClusterWizardContext } from './ClusterWizardContext';
import ClusterWizardFooter from './ClusterWizardFooter';
import ClusterWizardNavigation from './ClusterWizardNavigation';
import { WithErrorBoundary } from '@openshift-assisted/common/components/ErrorHandling/WithErrorBoundary';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';
import { Checkbox } from '@patternfly/react-core';

const KubeconfigDownload: React.FC<{ cluster: Cluster }> = ({ cluster }) => {
  const [isChecked, setIsChecked] = React.useState<boolean>(false);
  const clusterWizardContext = useClusterWizardContext();

  const footer = (
    <ClusterWizardFooter
      cluster={cluster}
      onNext={() => clusterWizardContext.moveNext()}
      onBack={() => clusterWizardContext.moveBack()}
      isNextDisabled={!isChecked}
      nextButtonText="Download Kubeconfig"
    />
  );

  return (
    <ClusterWizardStep navigation={<ClusterWizardNavigation cluster={cluster} />} footer={footer}>
      <WithErrorBoundary title="Failed to load Kubeconfig Download step">
        <ClusterWizardStepHeader>Download Kubeconfig</ClusterWizardStepHeader>
        <Checkbox
          id="Kubeconfig-download-agreement"
          isChecked={isChecked}
          onChange={() => setIsChecked(!isChecked)}
          label="I understand that I need to download Kubeconfig file prior of proceeding with the cluster installation."
        />
      </WithErrorBoundary>
    </ClusterWizardStep>
  );
};

export default KubeconfigDownload;
