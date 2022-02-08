import React from 'react';
import { useHistory } from 'react-router-dom';
import { Alert, AlertGroup, AlertVariant } from '@patternfly/react-core';
import {
  Cluster,
  WizardFooter,
  WizardFooterGenericProps,
  Alerts,
  useAlerts,
  CLUSTER_FIELD_LABELS,
} from '../../../common';
import { routeBasePath } from '../../config/routeBaseBath';
import { wizardStepsValidationsMap } from '../clusterWizard/wizardTransition';
import ClusterWizardContext from '../clusterWizard/ClusterWizardContext';
import ClusterWizardStepValidationsAlert from '../../../common/components/clusterWizard/ClusterWizardStepValidationsAlert';
import { selectClusterValidationsInfo } from '../../selectors/clusterSelectors';

type ClusterValidationSectionProps = {
  cluster?: Cluster;
  errorFields?: string[];
};

const ValidationSection = ({ cluster, errorFields = [] }: ClusterValidationSectionProps) => {
  const { currentStepId } = React.useContext(ClusterWizardContext);
  const validationsInfo = cluster && selectClusterValidationsInfo(cluster);
  return (
    <AlertGroup>
      {!!errorFields.length && (
        <Alert
          variant={AlertVariant.danger}
          title="Provided cluster configuration is not valid"
          isInline
        >
          The following fields are invalid or missing:{' '}
          {errorFields.map((field: string) => CLUSTER_FIELD_LABELS[field]).join(', ')}.
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
};

const ClusterWizardFooter = ({
  cluster,
  additionalActions,
  errorFields,

  onCancel,
  ...rest
}: ClusterWizardFooterProps) => {
  const { alerts } = useAlerts();
  const history = useHistory();

  const handleCancel = React.useCallback(() => history.push(`${routeBasePath}/clusters/`), [
    history,
  ]);

  const alertsSection = alerts.length ? <Alerts /> : undefined;
  const errorsSection = <ValidationSection cluster={cluster} errorFields={errorFields} />;

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
