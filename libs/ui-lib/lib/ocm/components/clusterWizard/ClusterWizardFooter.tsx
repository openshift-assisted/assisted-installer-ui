import React from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import { Alert, AlertGroup, AlertVariant } from '@patternfly/react-core';
import {
  WizardFooter,
  WizardFooterGenericProps,
  Alerts,
  useAlerts,
  clusterFieldLabels,
  selectClusterValidationsInfo,
} from '../../../common';
import { wizardStepsValidationsMap } from './wizardTransition';
import { useClusterWizardContext } from './ClusterWizardContext';
import ClusterWizardStepValidationsAlert from '../../../common/components/clusterWizard/ClusterWizardStepValidationsAlert';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { onFetchEvents } from '../fetching/fetchEvents';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';

type ClusterValidationSectionProps = {
  cluster?: Cluster;
  errorFields?: string[];
  alertTitle?: string;
  alertContent?: string | null;
};

const defaultAlertTitle = 'Provided cluster configuration is not valid';
const ValidationSection = ({
  cluster,
  errorFields = [],
  alertTitle,
  alertContent,
}: ClusterValidationSectionProps) => {
  const { currentStepId } = useClusterWizardContext();
  const validationsInfo = cluster && selectClusterValidationsInfo(cluster);
  const { t } = useTranslation();

  let _alertContent = alertContent;
  if (_alertContent === undefined) {
    _alertContent = `The following fields are invalid or missing: 
    ${errorFields.map((field: string) => clusterFieldLabels(t)[field] || field).join(', ')}.`;
  }
  return (
    <AlertGroup>
      {!!errorFields.length && (
        <Alert variant={AlertVariant.danger} title={alertTitle || defaultAlertTitle} isInline>
          {_alertContent}
        </Alert>
      )}

      {cluster && (
        <ClusterWizardStepValidationsAlert
          currentStepId={currentStepId}
          clusterStatus={cluster.status}
          hosts={cluster?.hosts || []}
          validationsInfo={validationsInfo}
          wizardStepsValidationsMap={wizardStepsValidationsMap}
        />
      )}
    </AlertGroup>
  );
};

type ClusterWizardFooterProps = WizardFooterGenericProps & {
  cluster?: Cluster;
  additionalActions?: React.ReactNode;
  errorFields?: string[];
  alertTitle?: string;
  alertContent?: string | null;
};

const ClusterWizardFooter = ({
  cluster,
  additionalActions,
  errorFields,
  alertTitle,
  alertContent,
  onCancel,
  ...rest
}: ClusterWizardFooterProps) => {
  const { alerts } = useAlerts();
  const navigate = useNavigate();

  const handleCancel = React.useCallback(() => navigate('..'), [navigate]);

  const alertsSection = alerts.length ? <Alerts /> : undefined;

  const errorsSection = (
    <ValidationSection
      cluster={cluster}
      errorFields={errorFields}
      alertTitle={alertTitle}
      alertContent={alertContent}
    />
  );

  return (
    <WizardFooter
      alerts={alertsSection}
      errors={errorsSection}
      onCancel={onCancel || handleCancel}
      leftExtraActions={additionalActions}
      cluster={cluster}
      onFetchEvents={onFetchEvents}
      {...rest}
    />
  );
};

export default ClusterWizardFooter;
