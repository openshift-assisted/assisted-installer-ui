import React from 'react';
import { WizardBody, WizardBodyProps } from '@patternfly/react-core';
import { css } from '@patternfly/react-styles';
import styles from '@patternfly/react-styles/css/components/Wizard/wizard';

import './ClusterWizardStep.css';

type ClusterWizardStepProps = {
  footer?: React.ReactNode;
  navigation?: React.ReactNode;
};

const ClusterWizardStep: React.FC<ClusterWizardStepProps> = ({ navigation, footer, children }) => {
  // activeStep is required, but we're not passing it. Using the cast to avoid TS error
  const activeStep = undefined as unknown as WizardBodyProps['activeStep'];
  return (
    <div className={css(styles.wizardOuterWrap, 'cluster-wizard-step')}>
      <div className={css(styles.wizardInnerWrap)}>
        {navigation}
        <WizardBody aria-labelledby="step-id" hasNoBodyPadding={false} activeStep={activeStep}>
          {children}
        </WizardBody>
      </div>
      {footer && <div className="pf-c-wizard__footer cluster-wizard-step__footer">{footer}</div>}
    </div>
  );
};

export default ClusterWizardStep;
