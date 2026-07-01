import React from 'react';
import {
  Card,
  Title,
  CardBody,
  CardHeader,
  CardExpandableContent,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';
import { ClusterProgress } from '../../../common';
import { ClusterStatusIcon } from '../clusters/ClusterStatus';
import {
  ClusterDetailStatusVarieties,
  useClusterStatusVarieties,
} from '../clusterDetail/ClusterDetailStatusVarieties';
import { ClusterDetailsButtonGroup } from '../clusterDetail/ClusterDetailsButtonGroup';
import { ClusterHostsTable } from '../hostsTable/ClusterHostsTable';

export const ClusterInstallationProgressCard: React.FC<{ cluster: Cluster }> = ({ cluster }) => {
  const [isCardExpanded, setIsCardExpanded] = React.useState(true);
  const clusterVarieties = useClusterStatusVarieties(cluster);

  return (
    <Card data-testid="ai-cluster-details-card" isExpanded={isCardExpanded}>
      <CardHeader
        onExpand={() => setIsCardExpanded(!isCardExpanded)}
        toggleButtonProps={{
          'data-testid': 'toggle-ai-cluster-details',
          'aria-label': 'AI Cluster Details',
          'aria-labelledby': 'titleId toggle-button',
          'aria-expanded': isCardExpanded,
        }}
      >
        <Title headingLevel="h1" size="lg" className="card-title">
          Installation progress
        </Title>
        {!isCardExpanded && (
          <div className="pf-v6-u-ml-md">
            <ClusterStatusIcon status={cluster.status} />
          </div>
        )}
      </CardHeader>
      <CardBody>
        <Stack hasGutter>
          <StackItem>
            <ClusterProgress
              cluster={cluster}
              minimizedView={!isCardExpanded}
              totalPercentage={cluster.progress?.totalPercentage || 0}
            />
          </StackItem>
          <StackItem>
            <ClusterDetailsButtonGroup
              cluster={cluster}
              credentials={clusterVarieties.credentials}
              credentialsError={clusterVarieties.credentialsError}
              showKubeConfig={false}
            />
          </StackItem>
        </Stack>
      </CardBody>
      <CardExpandableContent>
        <CardBody>
          <Stack hasGutter>
            <StackItem className="pf-v6-u-mt-lg">
              <ClusterDetailStatusVarieties
                cluster={cluster}
                clusterVarieties={clusterVarieties}
                showAddHostsInfo={false}
              />
            </StackItem>
            <StackItem className="pf-v6-u-mt-lg">
              <ClusterHostsTable cluster={cluster} skipDisabled />
            </StackItem>
          </Stack>
        </CardBody>
      </CardExpandableContent>
    </Card>
  );
};
