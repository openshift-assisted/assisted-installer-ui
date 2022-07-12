import React from 'react';
import { WizardBody } from '@patternfly/react-core';
import { css } from '@patternfly/react-styles';
import styles from '@patternfly/react-styles/css/components/Wizard/wizard';

import './ClusterWizardStep.css';

type ClusterWizardStepProps = {
  footer?: React.ReactNode;
  navigation?: React.ReactNode;
};

const ClusterWizardStep: React.FC<ClusterWizardStepProps> = ({ navigation, footer, children }) => {
  return (
    <div className={css(styles.wizardOuterWrap, 'cluster-wizard-step')}>
      <div className={css(styles.wizardInnerWrap)}>
        {navigation}
        {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          /* @ts-ignore: the prop should be optional depending on the WizardBody usage */
        }
        <WizardBody aria-labelledby="step-id" hasNoBodyPadding={false}>
          {children}
        </WizardBody>
      </div>
      {footer && <div className="pf-c-wizard__footer cluster-wizard-step__footer">{footer}</div>}
    </div>
  );
};

export default ClusterWizardStep;
