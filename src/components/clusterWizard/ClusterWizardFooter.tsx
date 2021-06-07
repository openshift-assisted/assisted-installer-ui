import React from 'react';
import { useHistory } from 'react-router-dom';
import { Spinner, Text, TextVariants, ToolbarItem } from '@patternfly/react-core';
import Alerts from '../ui/Alerts';
import { useAlerts } from '../AlertsContextProvider';
import { routeBasePath } from '../../config/constants';
import { Cluster } from '../../api/types';
import ClusterValidationSection from '../clusterConfiguration/ClusterValidationSection';
import { WizardFooter } from '../ui';

interface ClusterWizardFooterProps {
  cluster?: Cluster;
  errorFields?: string[];
  isSubmitting?: boolean;
  submittingText?: string;
  onNext?: () => void;
  isNextDisabled?: boolean;
  isBackDisabled?: boolean;
  onBack?: () => void;
  onCancel?: () => void;
  additionalActions?: React.ReactNode;
}

const ClusterWizardFooter = ({
  cluster,
  errorFields,
  onNext,
  onBack,
  isNextDisabled,
  isBackDisabled,
  onCancel,
  isSubmitting,
  submittingText = 'Saving changes...',
  additionalActions,
}: ClusterWizardFooterProps) => {
  const { alerts } = useAlerts();
  const history = useHistory();

  const handleCancel = React.useCallback(() => history.push(`${routeBasePath}/clusters/`), [
    history,
  ]);

  const rightExtraActions = isSubmitting ? (
    <ToolbarItem>
      <Text component={TextVariants.small}>
        <Spinner size="sm" /> {submittingText}
      </Text>
    </ToolbarItem>
  ) : undefined;

  const alertsSection = alerts.length ? <Alerts /> : undefined;

  return (
    <WizardFooter
      alerts={alertsSection}
      errors={<ClusterValidationSection cluster={cluster} errorFields={errorFields} />}
      onNext={onNext}
      onBack={onBack}
      onCancel={onCancel || handleCancel}
      isNextDisabled={isNextDisabled}
      isBackDisabled={isBackDisabled}
      leftExtraActions={additionalActions}
      rightExtraActions={rightExtraActions}
    />
  );
};

export default ClusterWizardFooter;
