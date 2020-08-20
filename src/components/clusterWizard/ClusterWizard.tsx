import React from 'react';
import { TextContent, Text } from '@patternfly/react-core';
import ClusterConfiguration from '../clusterConfiguration/ClusterConfiguration';
import BaremetalInventory from '../clusterConfiguration/BaremetalInventory';
import { Cluster } from '../../api/types';
import ClusterBreadcrumbs from '../clusters/ClusterBreadcrumbs';
import PageSection from '../ui/PageSection';
import ClusterWizardContext from './ClusterWizardContext';

type ClusterWizardProps = {
  cluster: Cluster;
};

const ClusterWizard: React.FC<ClusterWizardProps> = ({ cluster }) => {
  const [currentStepId, setCurrentStepId] = React.useState('baremetal-discovery');

  const renderCurrentStep = React.useCallback(() => {
    switch (currentStepId) {
      case 'baremetal-discovery':
        return <BaremetalInventory cluster={cluster} />;
      case 'cluster-configuration':
        return <ClusterConfiguration cluster={cluster} />;
      default:
        return <ClusterConfiguration cluster={cluster} />;
    }
  }, [currentStepId, cluster]);

  return (
    <ClusterWizardContext.Provider value={{ currentStepId, setCurrentStepId }}>
      <ClusterBreadcrumbs clusterName={cluster.name} />
      <PageSection>
        <TextContent>
          <Text component="h1">Create OpenShift cluster with the Assisted Installer</Text>
        </TextContent>
      </PageSection>
      <PageSection className="pf-c-page__main-wizard" isMain isWizard>
        <div className="pf-c-wizard">{renderCurrentStep()}</div>
      </PageSection>
    </ClusterWizardContext.Provider>
  );
};

export default ClusterWizard;
