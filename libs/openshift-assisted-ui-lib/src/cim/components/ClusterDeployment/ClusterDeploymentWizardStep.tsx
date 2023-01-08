import * as React from 'react';
import { ClusterWizardStep } from '../../../common/components/clusterWizard';
import ClusterDeploymentWizardNavigation from './ClusterDeploymentWizardNavigation';

type ClusterDeploymentWizardStepProps = {
  footer: React.ReactNode;
};

const ClusterDeploymentWizardStep: React.FC<ClusterDeploymentWizardStepProps> = (props) => (
  <ClusterWizardStep navigation={<ClusterDeploymentWizardNavigation />} {...props} />
);

export default ClusterDeploymentWizardStep;
