import React, { ReactNode } from 'react';
import { useHistory } from 'react-router-dom';
import { Alert, AlertGroup, AlertVariant } from '@patternfly/react-core';
import {
  Cluster,
  WizardFooter,
  WizardFooterGenericProps,
  Alerts,
  useAlerts,
  CLUSTER_FIELD_LABELS,
  selectClusterValidationsInfo,
} from '../../../common';
import { routeBasePath } from '../../config/routeBaseBath';
import { wizardStepsValidationsMap } from '../clusterWizard/wizardTransition';
import { useClusterWizardContext } from '../clusterWizard/ClusterWizardContext';
import ClusterWizardStepValidationsAlert from '../../../common/components/clusterWizard/ClusterWizardStepValidationsAlert';

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
  let _alertContent = alertContent;
  if (_alertContent === undefined) {
    _alertContent = `The following fields are invalid or missing: 
    ${errorFields.map((field: string) => CLUSTER_FIELD_LABELS[field] || field).join(', ')}.`;
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
  const history = useHistory();

  const handleCancel = React.useCallback(
    () => history.push(`${routeBasePath}/clusters/`),
    [history],
  );

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
      {...rest}
    />
  );
};

export default ClusterWizardFooter;
