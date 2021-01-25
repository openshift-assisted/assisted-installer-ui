import React from 'react';
import { WizardBody, WizardNav, WizardNavItem } from '@patternfly/react-core';
import { css } from '@patternfly/react-styles';
import styles from '@patternfly/react-styles/css/components/Wizard/wizard';
import ClusterWizardContext from './ClusterWizardContext';
import { ClusterWizardStepsType } from './wizardTransition';

type ClusterWizardStepProps = {
  footer?: React.ReactNode;
};

const wizardSteps: ClusterWizardStepsType[] = ['cluster-configuration', 'networking'];

const ClusterWizardStep: React.FC<ClusterWizardStepProps> = ({ footer, children }) => {
  const { currentStepId, setCurrentStepId } = React.useContext(ClusterWizardContext);

  const nav = (
    <WizardNav>
      <WizardNavItem
        content="Cluster Configuration"
        step={0}
        isDisabled={false /* Always enabled */}
        key="cluster-configuration"
        isCurrent={currentStepId === 'cluster-configuration'}
        onNavItemClick={() => setCurrentStepId('cluster-configuration')}
      />
      {/* <WizardNavItem
        key="baremetal-discovery"
        content="Bare Metal Discovery"
        isCurrent={currentStepId === 'baremetal-discovery'}
        isDisabled={false}
        step={1}
        onNavItemClick={() => setCurrentStepId('baremetal-discovery')}
      />*/}
      <WizardNavItem
        content="Networking"
        step={1}
        isDisabled={
          !wizardSteps
            .slice(
              1 /* TODO(mlibra): just to show principle. we will simplify when all steps are added. Step order - 1 */,
            )
            .includes(currentStepId)
        }
        key="networking"
        isCurrent={currentStepId === 'networking'}
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
      {footer && <div className="pf-c-wizard__footer">{footer}</div>}
    </div>
  );
};

export default ClusterWizardStep;
