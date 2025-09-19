import React from 'react';
import classNames from 'classnames';
import { LoadingState } from '../../../common';
import NetworkConfigurationPage from '../clusterConfiguration/networkConfiguration/NetworkConfigurationForm';
import ReviewStep from '../clusterConfiguration/review/ReviewStep';
import { useClusterWizardContext } from './ClusterWizardContext';
import ClusterDetails from './ClusterDetails';
import HostDiscovery from './HostDiscovery';
import Storage from './Storage';
import StaticIp from './StaticIp';
import Operators from './Operators';
import { WithErrorBoundary } from '../../../common/components/ErrorHandling/WithErrorBoundary';
import CustomManifestStep from './CustomManifestStep';
import {
  Cluster,
  InfraEnv,
  InfraEnvUpdateParams,
} from '@openshift-assisted/types/assisted-installer-service';
import CredentialsDownload from './CredentialsDownload';

type ClusterWizardProps = {
  cluster: Cluster;
  infraEnv: InfraEnv;
  updateInfraEnv: (infraEnvUpdateParams: InfraEnvUpdateParams) => Promise<InfraEnv>;
};

const ClusterWizard = ({ cluster, infraEnv, updateInfraEnv }: ClusterWizardProps) => {
  const { currentStepId } = useClusterWizardContext();

  const renderCurrentStep = React.useCallback(() => {
    switch (currentStepId) {
      case 'custom-manifests':
        return <CustomManifestStep cluster={cluster} />;
      case 'host-discovery':
        return <HostDiscovery cluster={cluster} />;
      case 'networking':
        return <NetworkConfigurationPage cluster={cluster} />;
      case 'review':
        return <ReviewStep cluster={cluster} />;
      case 'operators':
        return <Operators cluster={cluster} />;
      case 'storage':
        return <Storage cluster={cluster} />;
      case 'static-ip-host-configurations':
      case 'static-ip-network-wide-configurations':
      case 'static-ip-yaml-view':
        return <StaticIp cluster={cluster} infraEnv={infraEnv} updateInfraEnv={updateInfraEnv} />;
      case 'credentials-download':
        return <CredentialsDownload cluster={cluster} />;
      case 'cluster-details':
      default:
        return <ClusterDetails cluster={cluster} infraEnv={infraEnv} />;
    }
  }, [currentStepId, cluster, infraEnv, updateInfraEnv]);
  if (!currentStepId) {
    return <LoadingState />;
  }
  return (
    <WithErrorBoundary>
      <div className={classNames('pf-v6-c-wizard', 'cluster-wizard')}>{renderCurrentStep()}</div>
    </WithErrorBoundary>
  );
};

export default ClusterWizard;
