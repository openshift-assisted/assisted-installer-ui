import React from 'react';
import { useHistory } from 'react-router-dom';
import Alerts from '../ui/Alerts';
import { useAlerts } from '../AlertsContextProvider';
import { routeBasePath } from '../../config/constants';
import { Cluster } from '../../api/types';
import ClusterValidationSection from '../clusterConfiguration/ClusterValidationSection';
import { WizardFooter } from '../ui';
import { WizardFooterGenericProps } from '../ui/WizardFooter';

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
  const errorsSection = <ClusterValidationSection cluster={cluster} errorFields={errorFields} />;

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
