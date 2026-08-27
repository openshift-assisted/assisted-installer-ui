import React, { ReactNode } from 'react';
import { WizardNav } from '@patternfly/react-core';
import {
  canNextClusterDetails,
  canNextHostDiscovery,
  canNextNetwork,
  canNextStorage,
  ClusterWizardStepsType,
  getWizardNavEntries,
  isStaticIpStep,
} from '../utils/wizardTransition';
import { useClusterWizardContext } from '../clusterWizardContext/ClusterWizardContext';
import { staticIpFormViewSubSteps, wizardStepNames } from '../constants';
import WizardNavItem from '../../../../common/components/ui/WizardNavItem';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';

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

export const ClusterWizardNavigation = ({ cluster }: { cluster?: Cluster }) => {
  const clusterWizardContext = useClusterWizardContext();

  const isStepIdxAfterCurrent = (idx: number) => {
    return !clusterWizardContext.wizardStepIds
      .slice(idx)
      .includes(clusterWizardContext.currentStepId);
  };

  const isStepDisabled = (idx: number, stepId: ClusterWizardStepsType) => {
    return stepId === 'cluster-details' ? false : isStepIdxAfterCurrent(idx);
  };

  const getNavItem = (
    idx: number,
    stepId: ClusterWizardStepsType,
    visualNumber: number,
  ): ReactNode => {
    return (
      <WizardNavItem
        stepIndex={idx}
        key={stepId}
        id={`wizard-nv-${stepId}`}
        content={wizardStepNames[stepId]}
        onClick={() => clusterWizardContext.setCurrentStepId(stepId)}
        isCurrent={clusterWizardContext.currentStepId === stepId}
        isDisabled={isStepDisabled(idx, stepId)}
        isValid={() => isStepValid(stepId, cluster)}
        data-testid={`cluster-wizard-nav-item-${stepId}`}
        style={{ '--cluster-wizard-step-number': `"${visualNumber}"` } as React.CSSProperties}
      />
    );
  };

  const getStaticIpFormViewNavItem = (idx: number, visualNumber: number): ReactNode => {
    return (
      <WizardNavItem
        stepIndex={idx}
        isExpandable={true}
        content="Static network configurations"
        key="static-network-configuration-form-view"
        isCurrent={isStaticIpStep(clusterWizardContext.currentStepId)}
        isDisabled={isStepIdxAfterCurrent(idx)}
        data-testid={`cluster-wizard-nav-item-static-network-configuration-form-view`}
        style={{ '--cluster-wizard-step-number': `"${visualNumber}"` } as React.CSSProperties}
      >
        <WizardNav
          isInnerList
          data-testid="cluster-wizard-nav-item-static-network-configuration-form-view-inner-list"
        >
          {staticIpFormViewSubSteps.map((stepId, subIdx) => {
            return getNavItem(idx + subIdx, stepId, visualNumber);
          })}
        </WizardNav>
      </WizardNavItem>
    );
  };

  const getWizardNavItems = (): ReactNode[] => {
    return getWizardNavEntries(clusterWizardContext.wizardStepIds).map((entry) => {
      const idx = clusterWizardContext.wizardStepIds.indexOf(entry.stepId);
      if (entry.isStaticIpFormGroup) {
        return getStaticIpFormViewNavItem(idx, entry.visualNumber);
      }
      return getNavItem(idx, entry.stepId, entry.visualNumber);
    });
  };

  return <WizardNav data-testid="cluster-wizard-nav">{getWizardNavItems()}</WizardNav>;
};
