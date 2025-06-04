import React from 'react';
import {
  ButtonVariant,
  EmptyState,
  EmptyStateBody,
  Grid,
  PageSection,
  } from '@patternfly/react-core';
import {
  OcmCpuArchitecture,
  STANDALONE_DEPLOYMENT_ENABLED_FEATURES,
  ToolbarButton,
} from '../../../common';
import { OcmClusterType } from '../AddHosts';
import HostsClusterDetailTab from './HostsClusterDetailTab';
import clustersAPI from '../../../common/api/assisted-service/ClustersAPI';
import { OpenShiftVersionsContextProvider } from '../clusterWizard/OpenShiftVersionsContext';

const clusterWithoutMetrics = {
  id: 'ocm-cluster-id',
  external_id: 'day2flow-day1-ai-cluster-id',
  openshift_version: '4.12',
  cpu_architecture: OcmCpuArchitecture.x86,
  name: 'day2-flow',
} as unknown as OcmClusterType;

const clusterWithMetrics = {
  ...clusterWithoutMetrics,
  metrics: { nodes: { total: 3 } },
  api: { url: 'https://console-openshift-console.apps.day2-flow.redhat.com' },
};

const getCluster = (type: string) => {
  switch (type) {
    case 'no-metrics':
      return clusterWithoutMetrics;
    case 'with-metrics':
    default:
      return clusterWithMetrics;
  }
};

export const HostsClusterDetailTabMock = () => {
  const [tabShown, setTabShown] = React.useState<string>('');
  const [isMocked, setIsMocked] = React.useState<boolean>(false);

  React.useEffect(() => {
    const checkMockedClusterLoads = async () => {
      try {
        await clustersAPI.get('day2flow-day1-ai-cluster-id');
        setIsMocked(true);
      } catch (e) {
        setIsMocked(false);
      }
    };
    void checkMockedClusterLoads();
  }, []);

  const onAddHosts = (whichCase: string) => {
    if (!tabShown) {
      setTabShown(whichCase);
    }
  };

  if (!isMocked) {
    return (
      <PageSection hasBodyWrapper={false}  isFilled>
        <EmptyState  headingLevel="h4"   titleText="Mocked environment not detected">
          <EmptyStateBody>You can only use this page on a mocked environment</EmptyStateBody>
        </EmptyState>
      </PageSection>
    );
  }

  return (
    <PageSection hasBodyWrapper={false}  isFilled>
      {tabShown ? (
        <OpenShiftVersionsContextProvider>
          <HostsClusterDetailTab
            cluster={getCluster(tabShown)}
            allEnabledFeatures={STANDALONE_DEPLOYMENT_ENABLED_FEATURES}
            isVisible
          />
        </OpenShiftVersionsContextProvider>
      ) : (
        <Grid hasGutter>
          <ToolbarButton variant={ButtonVariant.primary} onClick={() => onAddHosts('no-metrics')}>
            Add hosts (No metrics)
          </ToolbarButton>
          <ToolbarButton variant={ButtonVariant.primary} onClick={() => onAddHosts('with-metrics')}>
            Add hosts (With metrics)
          </ToolbarButton>
        </Grid>
      )}
    </PageSection>
  );
};
