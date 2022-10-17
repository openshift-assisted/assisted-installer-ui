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

  return (
    <WizardNav>
      {wizardContext.wizardStepIds.map((step, index) => (
        <WizardNavItem
          key={index}
          step={index}
          content={day2WizardStepNames[step]}
          isCurrent={wizardContext.currentStepId === step}
          isDisabled={isStepDisabled(index, step)}
          onNavItemClick={() => wizardContext.setCurrentStepId(step)}
        />
      ))}
    </WizardNav>
  );
};
