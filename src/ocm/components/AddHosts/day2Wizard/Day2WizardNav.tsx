import React from 'react';
import { WizardNav, WizardNavItem } from '@patternfly/react-core';
import { Day2WizardStepsType, day2WizardStepNames } from './constants';
import { useDay2WizardContext } from './Day2WizardContext';

export const Day2WizardNav = () => {
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
        step={idx}
        key={stepId}
        content={day2WizardStepNames[stepId]}
        onNavItemClick={() => wizardContext.setCurrentStepId(stepId)}
        isCurrent={wizardContext.currentStepId === stepId}
        isDisabled={isStepDisabled(idx, stepId)}
      />
    );
  };
  //
  // const getStaticIpFormViewNavItem = (idx: number): React.ReactNode => {
  //   return (
  //     <WizardNavItem
  //       step={idx}
  //       isExpandable={true}
  //       content="Static network configurations"
  //       key="static-network-configuration-form-view"
  //       isCurrent={isStaticIpStep(wizardContext.currentStepId)}
  //       isDisabled={isStepIdxAfterCurrent(idx)}
  //     >
  //       <WizardNav returnList>
  //         {staticIpFormViewSubSteps.map((stepId, subIdx) => {
  //           return getNavItem(idx + subIdx, stepId);
  //         })}
  //       </WizardNav>
  //     </WizardNavItem>
  //   );
  // };

  const getWizardNavItems = (): React.ReactNode[] => {
    const navItems: React.ReactNode[] = [];
    let i = 0;
    while (i < wizardContext.wizardStepIds.length) {
      const stepId = wizardContext.wizardStepIds[i];
      navItems.push(getNavItem(i++, stepId));
    }
    return navItems;
  };

  return <WizardNav>{getWizardNavItems()}</WizardNav>;
};
