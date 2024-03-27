import React from 'react';
import { WizardBody, WizardBodyProps } from '@patternfly/react-core/deprecated';
import { css } from '@patternfly/react-styles';

import './ClusterWizardStep.css';

type ClusterWizardStepProps = {
  footer?: React.ReactNode;
  navigation?: React.ReactNode;
};

export const ClusterWizardStep = ({
  navigation,
  footer,
  children,
}: React.PropsWithChildren<ClusterWizardStepProps>) => {
  // activeStep is required, but we're not passing it. Using the cast to avoid TS error
  const activeStep = undefined as unknown as WizardBodyProps['activeStep'];
  return (
    <div className={css('pf-v5-c-wizard__outer-wrap', 'cluster-wizard-step')}>
      <div className={css('pf-v5-c-wizard__inner-wrap')}>
        {navigation}
        <WizardBody aria-labelledby="step-id" hasNoBodyPadding={false} activeStep={activeStep}>
          {children}
        </WizardBody>
      </div>
      {footer && <div className="pf-v5-c-wizard__footer cluster-wizard-step__footer">{footer}</div>}
    </div>
  );
};

// export default ClusterWizardStep;
