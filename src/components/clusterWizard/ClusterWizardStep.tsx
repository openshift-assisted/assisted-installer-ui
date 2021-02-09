import React from 'react';
import { WizardBody, WizardNav, WizardNavItem, WizardNavItemProps } from '@patternfly/react-core';
import { css } from '@patternfly/react-styles';
import styles from '@patternfly/react-styles/css/components/Wizard/wizard';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import { global_warning_color_100 as warningColor } from '@patternfly/react-tokens';
import { Cluster } from '../../api/types';
import ClusterWizardContext from './ClusterWizardContext';
import {
  canNextBaremetalDiscovery,
  canNextClusterDetails,
  canNextNetworkBackend,
  ClusterWizardStepsType,
} from './wizardTransition';

type ClusterWizardStepProps = {
  cluster: Cluster;
  footer?: React.ReactNode;
};

const wizardSteps: ClusterWizardStepsType[] = [
  'cluster-details',
  'baremetal-discovery',
  'networking',
  'review',
];

const NavItem: React.FC<WizardNavItemProps & { isValid?: () => boolean }> = ({
  isValid = () => true,
  ...props
}) => {
  const { content, isDisabled, isCurrent } = props;

  let validatedLinkName = content;
  if (!isDisabled && !isCurrent && !isValid()) {
    validatedLinkName = (
      <>
        <ExclamationTriangleIcon
          className="wizard-nav-item-warning-icon"
          color={warningColor.value}
          size="sm"
        />{' '}
        {content}
      </>
    );
  }

  return <WizardNavItem {...props} content={validatedLinkName} />;
};

const ClusterWizardStep: React.FC<ClusterWizardStepProps> = ({ cluster, footer, children }) => {
  const { currentStepId, setCurrentStepId } = React.useContext(ClusterWizardContext);

  const nav = (
    <WizardNav>
      <NavItem
        key="cluster-details"
        content="Cluster Details"
        isCurrent={currentStepId === 'cluster-details'}
        isValid={() => canNextClusterDetails({ cluster })}
        isDisabled={false}
        step={0}
        onNavItemClick={() => setCurrentStepId('cluster-details')}
      />
      <NavItem
        key="baremetal-discovery"
        content="Bare Metal Discovery"
        isDisabled={!wizardSteps.slice(1).includes(currentStepId)}
        isValid={() => canNextBaremetalDiscovery({ cluster })}
        isCurrent={currentStepId === 'baremetal-discovery'}
        step={1}
        onNavItemClick={() => setCurrentStepId('baremetal-discovery')}
      />
      <NavItem
        content="Networking"
        step={2}
        isDisabled={!wizardSteps.slice(2).includes(currentStepId)}
        isValid={() => canNextNetworkBackend({ cluster })}
        key="networking"
        isCurrent={currentStepId === 'networking'}
        onNavItemClick={() => setCurrentStepId('networking')}
      />
      <NavItem
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
