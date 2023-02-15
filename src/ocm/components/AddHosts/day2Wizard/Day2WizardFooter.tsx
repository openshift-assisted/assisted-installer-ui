import React from 'react';

import { useDay2WizardContext } from './Day2WizardContext';
import { Alerts, useAlerts, WizardFooter } from '../../../../common';

type Day2WizardFooterProps = {
  isSubmitting: boolean;
  isNextDisabled?: boolean;
  onCancel: () => void;
  onNext?: () => void;
};

const Day2WizardFooter = ({
  isSubmitting,
  isNextDisabled,
  onNext,
  onCancel,
}: Day2WizardFooterProps) => {
  const wizardContext = useDay2WizardContext();

  const { alerts, clearAlerts } = useAlerts();
  const disableNext =
    alerts.length > 0 || wizardContext.currentStepId === 'download-iso' || isNextDisabled;

  const closeWizard = React.useCallback(() => {
    clearAlerts();
    onCancel();
  }, [onCancel, clearAlerts]);

  const onBack = React.useCallback(() => {
    clearAlerts();
    wizardContext.moveBack();
  }, [wizardContext, clearAlerts]);

  return (
    <WizardFooter
      alerts={alerts ? <Alerts /> : undefined}
      onNext={onNext || (() => wizardContext.moveNext())}
      onBack={onBack}
      isSubmitting={isSubmitting}
      isBackDisabled={wizardContext.currentStepId === 'cluster-details'}
      isNextDisabled={disableNext}
      onCancel={closeWizard}
    />
  );
};

export default Day2WizardFooter;
