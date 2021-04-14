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
import { Cluster, stringToJSON } from '../../api';
import { AlertsContextProvider } from '../AlertsContextProvider';
import CancelInstallationModal from './CancelInstallationModal';
import ClusterProgress from './ClusterProgress';
import ResetClusterModal from './ResetClusterModal';
import HostsTable from '../hosts/HostsTable';
import ClusterDetailsButtonGroup from './ClusterDetailsButtonGroup';
import { ClusterStatusIcon } from '../clusters/ClusterStatus';
import ClusterDetailStatusVarieties, {
  useClusterStatusVarieties,
} from './ClusterDetailStatusVarieties';
import { HostDialogsContextProvider } from '../hosts/HostDialogsContext';

type ClusterInstallationProgressCardProps = {
  clusterStringObj: string;
};

const ClusterInstallationProgressCard: React.FC<ClusterInstallationProgressCardProps> = ({
  clusterStringObj,
}) => {
  const cluster: Cluster = React.useMemo(() => stringToJSON<Cluster>(clusterStringObj) as Cluster, [
    clusterStringObj,
  ]);

  const [isCardExpanded, setIsCardExpanded] = React.useState(cluster.status !== 'installed');
  const clusterVarieties = useClusterStatusVarieties(cluster);

  return (
    <AlertsContextProvider>
      <HostDialogsContextProvider>
        <Card data-testid="ai-cluster-details-card" isExpanded={isCardExpanded}>
          <CancelInstallationModal />
          <ResetClusterModal />
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
              <div className="pf-u-ml-md">
                <ClusterStatusIcon status={cluster.status} />
              </div>
            )}
          </CardHeader>
          <CardBody>
            <ClusterProgress cluster={cluster} minimizedView={!isCardExpanded} />
            <ClusterDetailsButtonGroup cluster={cluster} />
          </CardBody>
          <CardExpandableContent>
            <CardBody>
              <Grid hasGutter>
                <ClusterDetailStatusVarieties
                  cluster={cluster}
                  clusterVarieties={clusterVarieties}
                />
                <GridItem>
                  <HostsTable cluster={cluster} skipDisabled />
                </GridItem>
              </Grid>
            </CardBody>
          </CardExpandableContent>
        </Card>
      </HostDialogsContextProvider>
    </AlertsContextProvider>
  );
};

export default ClusterInstallationProgressCard;
