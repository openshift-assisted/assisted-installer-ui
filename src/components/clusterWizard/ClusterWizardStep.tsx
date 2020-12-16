import React from 'react';
import { WizardBody, WizardNav, WizardNavItem } from '@patternfly/react-core';
import { css } from '@patternfly/react-styles';
import styles from '@patternfly/react-styles/css/components/Wizard/wizard';
import ClusterWizardContext from './ClusterWizardContext';
import {
  CLUSTER_STEPS_ORDER,
  CLUSTER_STEP_CONFIGURATION,
  CLUSTER_STEP_NETWORKING,
} from './constants';

type ClusterWizardStepProps = {
  footer?: React.ReactNode;
};

const ClusterWizardStep: React.FC<ClusterWizardStepProps> = ({ footer, children }) => {
  const { currentStepId, setCurrentStepId } = React.useContext(ClusterWizardContext);

  const getTransitionProps = (step: string) => ({
    key: step,
    isCurrent: currentStepId === step,
    isDisabled: CLUSTER_STEPS_ORDER[step] > CLUSTER_STEPS_ORDER[currentStepId],
    step: CLUSTER_STEPS_ORDER[step],
    onNavItemClick: () => setCurrentStepId(step),
  });

  const nav = (
    <WizardNav>
      <WizardNavItem
        content="Cluster Configuration"
        {...getTransitionProps(CLUSTER_STEP_CONFIGURATION)}
      />
      {/* <WizardNavItem
        key="baremetal-discovery"
        content="Bare Metal Discovery"
        isCurrent={currentStepId === 'baremetal-discovery'}
        isDisabled={false}
        step={1}
        onNavItemClick={() => setCurrentStepId('baremetal-discovery')}
      />*/}
      <WizardNavItem content="Networking" {...getTransitionProps(CLUSTER_STEP_NETWORKING)} />
    </WizardNav>
  );

  return (
    <div className={css(styles.wizardOuterWrap)}>
      <div className={css(styles.wizardInnerWrap)}>
        {nav}
        <WizardBody aria-labelledby="step-id" hasNoBodyPadding={false}>
          {children}
        </WizardBody>
      </div>
      {footer && <div className="pf-c-wizard__footer">{footer}</div>}
    </div>
  );
};

export default ClusterWizardStep;
