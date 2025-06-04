import React from 'react';
import {
  Card,
  Title,
  CardBody,
  CardHeader,
  CardExpandableContent,
  Grid,
  GridItem,
} from '@patternfly/react-core';
import { ClusterProgress } from '../../../common';
import ClusterHostsTable from '../hosts/ClusterHostsTable';
import ClusterDetailsButtonGroup from './ClusterDetailsButtonGroup';
import { ClusterStatusIcon } from '../clusters/ClusterStatus';
import ClusterDetailStatusVarieties, {
  useClusterStatusVarieties,
} from './ClusterDetailStatusVarieties';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';

const ClusterInstallationProgressCard: React.FC<{ cluster: Cluster }> = ({ cluster }) => {
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
        <ClusterProgress
          cluster={cluster}
          minimizedView={!isCardExpanded}
          totalPercentage={cluster.progress?.totalPercentage || 0}
        />
        <ClusterDetailsButtonGroup
          cluster={cluster}
          credentials={clusterVarieties.credentials}
          credentialsError={clusterVarieties.credentialsError}
          showKubeConfig={false}
        />
      </CardBody>
      <CardExpandableContent>
        <CardBody>
          <Grid hasGutter>
            <ClusterDetailStatusVarieties
              cluster={cluster}
              clusterVarieties={clusterVarieties}
              showAddHostsInfo={false}
            />
            <GridItem>
              <ClusterHostsTable cluster={cluster} skipDisabled />
            </GridItem>
          </Grid>
        </CardBody>
      </CardExpandableContent>
    </Card>
  );
};

export default ClusterInstallationProgressCard;
