import React, { ReactNode } from 'react';
import { WizardNav } from '@patternfly/react-core';
import { Cluster } from '../../../common';
import {
  canNextClusterDetails,
  canNextHostDiscovery,
  canNextNetwork,
  canNextStorage,
  ClusterWizardStepsType,
  isStaticIpStep,
} from './wizardTransition';
import { useClusterWizardContext } from './ClusterWizardContext';
import { staticIpFormViewSubSteps, wizardStepNames } from './constants';
import WizardNavItem from '../../../common/components/ui/WizardNavItem';

const isStepValid = (stepId: ClusterWizardStepsType, cluster?: Cluster): boolean => {
  if (!cluster) {
    return true;
  }
  switch (stepId) {
    case 'cluster-details':
      return !cluster.validationsInfo || canNextClusterDetails({ cluster });
    case 'static-ip-yaml-view':
    case 'static-ip-host-configurations':
    case 'static-ip-network-wide-configurations':
      return canNextClusterDetails({ cluster });
    case 'host-discovery':
      return canNextHostDiscovery({ cluster });
    case 'storage':
      return canNextStorage({ cluster });
    case 'networking':
      return canNextNetwork({ cluster });
    default:
      return true;
  }
};

const ClusterWizardNavigation = ({ cluster }: { cluster?: Cluster }) => {
  const clusterWizardContext = useClusterWizardContext();

  const isStepIdxAfterCurrent = (idx: number) => {
    return !clusterWizardContext.wizardStepIds
      .slice(idx)
      .includes(clusterWizardContext.currentStepId);
  };

  const isStepDisabled = (idx: number, stepId: ClusterWizardStepsType) => {
    return stepId === 'cluster-details' ? false : isStepIdxAfterCurrent(idx);
  };

  const getNavItem = (idx: number, stepId: ClusterWizardStepsType): ReactNode => {
    return (
      <WizardNavItem
        step={idx}
        key={stepId}
        content={wizardStepNames[stepId]}
        onNavItemClick={() => clusterWizardContext.setCurrentStepId(stepId)}
        isCurrent={clusterWizardContext.currentStepId === stepId}
        isDisabled={isStepDisabled(idx, stepId)}
        isValid={() => isStepValid(stepId, cluster)}
      />
    );
  };

  const getStaticIpFormViewNavItem = (idx: number): ReactNode => {
    return (
      <WizardNavItem
        step={idx}
        isExpandable={true}
        content="Static network configurations"
        key="static-network-configuration-form-view"
        isCurrent={isStaticIpStep(clusterWizardContext.currentStepId)}
        isDisabled={isStepIdxAfterCurrent(idx)}
      >
        <WizardNav returnList>
          {staticIpFormViewSubSteps.map((stepId, subIdx) => {
            return getNavItem(idx + subIdx, stepId);
          })}
        </WizardNav>
      </WizardNavItem>
    );
  };

  const getWizardNavItems = (): ReactNode[] => {
    const navItems: ReactNode[] = [];
    let i = 0;
    while (i < clusterWizardContext.wizardStepIds.length) {
      const stepId = clusterWizardContext.wizardStepIds[i];
      if (stepId !== 'static-ip-network-wide-configurations') {
        navItems.push(getNavItem(i, stepId));
        i += 1;
      } else {
        navItems.push(getStaticIpFormViewNavItem(i));
        //skip iteration on form view sub steps
        i += 2;
      }
    }
    return navItems;
  };

  return <WizardNav>{getWizardNavItems()}</WizardNav>;
};

export default ClusterWizardNavigation;
