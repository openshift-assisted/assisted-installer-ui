import React from 'react';
import { WizardBody, WizardNav, WizardNavItem } from '@patternfly/react-core';
import { css } from '@patternfly/react-styles';
import styles from '@patternfly/react-styles/css/components/Wizard/wizard';
import ClusterWizardContext from './ClusterWizardContext';
import { ClusterWizardStepsType } from './wizardTransition';

type ClusterWizardStepProps = {
  footer?: React.ReactNode;
};

const wizardSteps: ClusterWizardStepsType[] = [
  'cluster-details',
  'baremetal-discovery',
  'networking',
  'review',
];

const ClusterWizardStep: React.FC<ClusterWizardStepProps> = ({ footer, children }) => {
  const { currentStepId, setCurrentStepId } = React.useContext(ClusterWizardContext);

  const nav = (
    <WizardNav>
      <WizardNavItem
        key="cluster-details"
        content="Cluster Details"
        isCurrent={currentStepId === 'cluster-details'}
        isDisabled={false}
        step={0}
        onNavItemClick={() => setCurrentStepId('cluster-details')}
      />
      <WizardNavItem
        key="baremetal-discovery"
        content="Bare Metal Discovery"
        isDisabled={!wizardSteps.slice(1).includes(currentStepId)}
        isCurrent={currentStepId === 'baremetal-discovery'}
        step={1}
        onNavItemClick={() => setCurrentStepId('baremetal-discovery')}
      />
      <WizardNavItem
        content="Networking"
        step={2}
        isDisabled={!wizardSteps.slice(2).includes(currentStepId)}
        key="networking"
        isCurrent={currentStepId === 'networking'}
        onNavItemClick={() => setCurrentStepId('networking')}
      />
      <WizardNavItem
        content="Review & Create"
        step={3}
        isDisabled={!wizardSteps.slice(3).includes(currentStepId)}
        key="review"
        isCurrent={currentStepId === 'review'}
        onNavItemClick={() => setCurrentStepId('review')}
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
      {footer && <div className="pf-c-wizard__footer">{footer}</div>}
    </div>
  );
};

export default ClusterWizardStep;
