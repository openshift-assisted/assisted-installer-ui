import React, { ReactNode } from 'react';
import { WizardNav, WizardNavItem } from '@patternfly/react-core';
import { Cluster } from '../../../common';
import {
  canNextClusterDetails,
  canNextHostDiscovery,
  canNextNetwork,
  ClusterWizardStepsType,
  isStaticIpStep,
} from './wizardTransition';
import { useClusterWizardContext } from './ClusterWizardContext';
import { staticIpFormViewSubSteps, wizardStepNames } from './constants';
import { getNavItemContent } from '../../../common/components/ui/WizardNavItem';

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
    case 'networking':
      return canNextNetwork({ cluster });
    default:
      return true;
  }
};

const ClusterWizardNavigation: React.FC<{ cluster?: Cluster }> = ({ cluster }) => {
  const { currentStepId, setCurrentStepId, wizardStepIds } = useClusterWizardContext();

  const getNavItem = (idx: number, stepId: ClusterWizardStepsType): ReactNode => {
    const isCurrent = currentStepId === stepId;
    const content = wizardStepNames[stepId];
    const isDisabled =
      stepId === 'cluster-details' ? false : !wizardStepIds.slice(idx).includes(currentStepId);
    const isValid = () => isStepValid(stepId, cluster);
    return (
      <WizardNavItem
        step={idx}
        key={stepId}
        content={getNavItemContent(content, isValid, isDisabled, isCurrent)}
        onNavItemClick={() => setCurrentStepId(stepId)}
        isCurrent={isCurrent}
        isDisabled={isDisabled}
      />
    );
  };

  const getStaticIpFormViewNavItem = (idx: number): ReactNode => {
    return (
      <WizardNavItem
        step={20}
        isExpandable={true}
        content="Static network configurations"
        key="static-network-configuration-form-view"
        isCurrent={isStaticIpStep(currentStepId)}
        isDisabled={!wizardStepIds.slice(idx).includes(currentStepId)}
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
    while (i < wizardStepIds.length) {
      const stepId = wizardStepIds[i];
      if (stepId !== 'static-ip-network-wide-configurations') {
        navItems.push(getNavItem(i, stepId));
        i += 1;
      } else {
        navItems.push(getStaticIpFormViewNavItem(i));
        i += 2;
      }
    }
    return navItems;
  };

  return <WizardNav>{getWizardNavItems()}</WizardNav>;
};

export default ClusterWizardNavigation;
