import React from 'react';
import { WizardNav, WizardNavItem } from '@patternfly/react-core';
import { Day2WizardStepsType, day2WizardStepNames, staticIpFormViewSubSteps } from './constants';
import { useDay2WizardContext } from './Day2WizardContext';
import { isStaticIpStep } from '../../clusterWizard/wizardTransition';

const Day2WizardNav = () => {
  const wizardContext = useDay2WizardContext();

  const isStepIdxAfterCurrent = (idx: number) => {
    return !wizardContext.wizardStepIds.slice(idx).includes(wizardContext.currentStepId);
  };

  const isStepDisabled = (idx: number, stepId: Day2WizardStepsType) => {
    return stepId === 'cluster-details' ? false : isStepIdxAfterCurrent(idx);
  };

  const getNavItem = (idx: number, stepId: Day2WizardStepsType): React.ReactNode => {
    return (
      <WizardNavItem
        stepIndex={idx}
        key={stepId}
        content={day2WizardStepNames[stepId]}
        onClick={() => wizardContext.setCurrentStepId(stepId)}
        isCurrent={wizardContext.currentStepId === stepId}
        isDisabled={isStepDisabled(idx, stepId)}
        data-testid={`day2-wizard-nav-item-${stepId}`}
      />
    );
  };

  const getStaticIpFormViewNavItem = (idx: number): React.ReactNode => {
    return (
      <WizardNavItem
        stepIndex={idx}
        isExpandable={true}
        content="Static network configurations"
        key="static-network-configuration-form-view"
        isCurrent={isStaticIpStep(wizardContext.currentStepId)}
        isDisabled={isStepIdxAfterCurrent(idx)}
        data-testid={`day2-wizard-nav-item-static-network-configuration-form-view`}
      >
        <WizardNav
          isInnerList
          data-testid="day2-wizard-nav-item-static-network-configuration-form-view-inner-list"
        >
          {staticIpFormViewSubSteps.map((stepId, subIdx) => {
            return getNavItem(idx + subIdx, stepId);
          })}
        </WizardNav>
      </WizardNavItem>
    );
  };

  const getWizardNavItems = (): React.ReactNode[] => {
    const navItems: React.ReactNode[] = [];
    let i = 0;
    while (i < wizardContext.wizardStepIds.length) {
      const stepId = wizardContext.wizardStepIds[i];
      if (stepId === 'static-ip-network-wide-configurations') {
        navItems.push(getStaticIpFormViewNavItem(i));
        //skip iteration on form view sub steps
        i += 2;
      } else {
        navItems.push(getNavItem(i, stepId));
        i += 1;
      }
    }
    return navItems;
  };

  return <WizardNav data-testid="day2-wizard-nav">{getWizardNavItems()}</WizardNav>;
};

export default Day2WizardNav;
