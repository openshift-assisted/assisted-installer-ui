import React from 'react';
import { WizardBody, WizardNav, WizardNavItem } from '@patternfly/react-core';
import { css } from '@patternfly/react-styles';
import styles from '@patternfly/react-styles/css/components/Wizard/wizard';
import ClusterWizardContext from './ClusterWizardContext';

type ClusterWizardStepProps = {
  footer?: React.ReactNode;
};

const ClusterWizardStep: React.FC<ClusterWizardStepProps> = ({ footer, children }) => {
  const { currentStepId, setCurrentStepId } = React.useContext(ClusterWizardContext);
  const nav = (
    <WizardNav>
      <WizardNavItem
        key="cluster-configuration"
        content="Cluster Configuration"
        isCurrent={currentStepId === 'cluster-configuration'}
        isDisabled={false}
        step={1}
        onNavItemClick={() => setCurrentStepId('cluster-configuration')}
      />
      {/* <WizardNavItem
        key="baremetal-discovery"
        content="Bare Metal Discovery"
        isCurrent={currentStepId === 'baremetal-discovery'}
        isDisabled={false}
        step={1}
        onNavItemClick={() => setCurrentStepId('baremetal-discovery')}
      />
      <WizardNavItem
        key="networking"
        content="Networking"
        isCurrent={currentStepId === 'networking'}
        isDisabled={false}
        step={2}
        onNavItemClick={() => setCurrentStepId('networking')}
      /> */}
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
