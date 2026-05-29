import React from 'react';
import classNames from 'classnames';
import {
  Cluster,
  InfraEnv,
  InfraEnvUpdateParams,
} from '@openshift-assisted/types/assisted-installer-service';
import { LoadingState, WithErrorBoundary } from '../../../common';
import NetworkConfigurationPage from '../clusterConfiguration/networkConfiguration/NetworkConfigurationForm';
import CredentialsDownload from '../clusterWizard/CredentialsDownload';
import CustomManifestStep from '../clusterWizard/CustomManifestStep';
import HostDiscovery from '../clusterWizard/HostDiscovery';
import Storage from '../clusterWizard/Storage';
import ReviewStep from '../clusterConfiguration/review/ReviewStep';
import { useClusterWizardContext } from './clusterWizardContext';
import { ClusterDetails, StaticIp, Operators } from './steps';

type ClusterWizardProps = {
  cluster: Cluster;
  infraEnv: InfraEnv;
  updateInfraEnv: (infraEnvUpdateParams: InfraEnvUpdateParams) => Promise<InfraEnv>;
};

export const ClusterWizard = ({ cluster, infraEnv, updateInfraEnv }: ClusterWizardProps) => {
  const { currentStepId } = useClusterWizardContext();

  const renderCurrentStep = React.useCallback(() => {
    switch (currentStepId) {
      case 'static-ip-host-configurations':
      case 'static-ip-network-wide-configurations':
      case 'static-ip-yaml-view':
        return <StaticIp cluster={cluster} infraEnv={infraEnv} updateInfraEnv={updateInfraEnv} />;
      case 'operators':
        return <Operators cluster={cluster} />;
      case 'host-discovery':
        return <HostDiscovery cluster={cluster} />;
      case 'custom-manifests':
        return <CustomManifestStep cluster={cluster} />;
      case 'networking':
        return <NetworkConfigurationPage cluster={cluster} />;
      case 'storage':
        return <Storage cluster={cluster} />;
      case 'credentials-download':
        return <CredentialsDownload cluster={cluster} />;
      case 'review':
        return <ReviewStep cluster={cluster} />;
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
