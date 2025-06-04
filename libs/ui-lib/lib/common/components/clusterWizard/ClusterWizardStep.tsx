import React from 'react';
import { WizardBody } from '@patternfly/react-core';
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
  return (
    <div className={css('pf-v6-c-wizard__outer-wrap', 'cluster-wizard-step')}>
      <div className={css('pf-v6-c-wizard__inner-wrap')}>
        {navigation}
        <WizardBody aria-labelledby="step-id" hasNoPadding={false}>
          {children}
        </WizardBody>
      </div>
      {footer && <div className="pf-v6-c-wizard__footer cluster-wizard-step__footer">{footer}</div>}
    </div>
  );
};

// export default ClusterWizardStep;
