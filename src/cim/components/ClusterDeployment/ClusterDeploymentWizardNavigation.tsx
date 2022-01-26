import React from 'react';
import { WizardNav } from '@patternfly/react-core';
import { WizardNavItem } from '../../../common';
import { wizardStepNames } from './constants';
import ClusterDeploymentWizardContext from './ClusterDeploymentWizardContext';
import { ClusterDeploymentWizardStepsType } from './types';
import { isCIMFlow } from './helpers';

const wizardSteps = Object.keys(wizardStepNames) as ClusterDeploymentWizardStepsType[];

const ClusterDeploymentWizardNavigation: React.FC<{
  // cluster?: Cluster
}> = () => {
  const { currentStepId, setCurrentStepId, clusterDeployment } = React.useContext(
    ClusterDeploymentWizardContext,
  );

  return (
    <WizardNav>
      <WizardNavItem key="installation-type" content="Installation type" step={0} isDisabled />
      <WizardNavItem
        key="cluster-details"
        content={wizardStepNames['cluster-details']}
        isCurrent={currentStepId === 'cluster-details'}
        // isValid={ () => !cluster || canNextHostDiscovery({ cluster }) }
        isDisabled={false}
        step={1}
        onNavItemClick={() => setCurrentStepId('cluster-details')}
      />
      <WizardNavItem key="automation" content="Automation" step={2} isDisabled />
      {isCIMFlow(clusterDeployment) ? (
        <WizardNavItem
          key="hosts-selection"
          content={wizardStepNames['hosts-selection']}
          isDisabled={!wizardSteps.slice(1).includes(currentStepId)}
          // isValid={ () => !cluster || canNextHostDiscovery({ cluster }) }
          isCurrent={currentStepId === 'hosts-selection'}
          step={2}
          onNavItemClick={() => setCurrentStepId('hosts-selection')}
        />
      ) : (
        <WizardNavItem
          key="hosts-discovery"
          content={wizardStepNames['hosts-discovery']}
          isDisabled={!wizardSteps.slice(1).includes(currentStepId)}
          // isValid={ () => !cluster || canNextHostDiscovery({ cluster }) }
          isCurrent={currentStepId === 'hosts-discovery'}
          step={2}
          onNavItemClick={() => setCurrentStepId('hosts-discovery')}
        />
      )}
      <WizardNavItem
        key="networking"
        content={wizardStepNames['networking']}
        isDisabled={!wizardSteps.slice(2).includes(currentStepId)}
        // isValid={ () => !cluster || canNextHostDiscovery({ cluster }) }
        isCurrent={currentStepId === 'networking'}
        step={3}
        onNavItemClick={() => setCurrentStepId('networking')}
      />
      {/* <WizardNavItem key="review" content="Review" step={4} isDisabled /> */}
    </WizardNav>
  );
};

export default ClusterDeploymentWizardNavigation;
