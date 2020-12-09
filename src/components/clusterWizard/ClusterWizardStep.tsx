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
      />
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
      {/* NOTE(jtomasek): Adding explicit padding as nested PageSection inherits noPadding set by the parent PageSection */}
      {footer && (
        <div style={{ padding: 'var(--pf-c-wizard__main-body--PaddingTop)' }}>{footer}</div>
      )}
    </div>
  );
};

export default ClusterWizardStep;
