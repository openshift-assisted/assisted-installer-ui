import React from 'react';
import { Card, Title, CardBody, CardHeader, CardExpandableContent } from '@patternfly/react-core';
import {
  Cluster,
  ClusterStatusEnum,
  Credentials,
  getClusterCredentials,
  stringToJSON,
} from '../../api';
import { AlertsContextProvider } from '../AlertsContextProvider';
import CancelInstallationModal from './CancelInstallationModal';
import ClusterCredentials from './ClusterCredentials';
import ClusterInstallationError from './ClusterInstallationError';
import ClusterProgress from './ClusterProgress';
import FailedHostsWarning from './FailedHostsWarning';
import ResetClusterModal from './ResetClusterModal';
import HostsTable from '../hosts/HostsTable';
import ClusterDetailsButtonGroup from './ClusterDetailsButtonGroup';
import { ClusterStatusIcon } from '../clusters/ClusterStatus';

import './ClusterInstallationProgressCard.css';

type AIClusterDetailsCardProps = {
  clusterObj: Cluster;
};

const getID = (suffix: string) => `cluster-detail-${suffix}`;

const AIClusterDetailsCard: React.FC<AIClusterDetailsCardProps> = ({ clusterObj }) => {
  const [cancelInstallationModalOpen, setCancelInstallationModalOpen] = React.useState(false);
  const [resetClusterModalOpen, setResetClusterModalOpen] = React.useState(false);
  const [credentials, setCredentials] = React.useState<Credentials>();
  const [credentialsError, setCredentialsError] = React.useState();
  const [isCardExpanded, setIsCardExpanded] = React.useState(true);

  // CamelCase the cluster object
  const cluster: Cluster = stringToJSON<Cluster>(JSON.stringify(clusterObj)) || clusterObj;

  const fetchCredentials = React.useCallback(() => {
    const fetch = async () => {
      setCredentialsError(undefined);
      try {
        const response = await getClusterCredentials(cluster.id);
        setCredentials(response.data);
      } catch (err) {
        setCredentialsError(err);
      }
    };
    fetch();
  }, [cluster.id]);

  React.useEffect(() => {
    if (cluster.status === ClusterStatusEnum.INSTALLED) {
      fetchCredentials();
    }
  }, [cluster.status, fetchCredentials]);

  return (
    <>
      <AlertsContextProvider>
        <CancelInstallationModal
          isOpen={cancelInstallationModalOpen}
          onClose={() => setCancelInstallationModalOpen(false)}
          clusterId={cluster.id}
        />
        <ResetClusterModal
          isOpen={resetClusterModalOpen}
          onClose={() => setResetClusterModalOpen(false)}
          cluster={cluster}
        />
      </AlertsContextProvider>
      <Card id="ai-cluster-details-card" isExpanded={isCardExpanded}>
        <CardHeader
          onExpand={() => setIsCardExpanded(!isCardExpanded)}
          toggleButtonProps={{
            id: 'toggle-ai-cluster-details',
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
        {!isCardExpanded && (
          <CardBody>
            <ClusterProgress cluster={cluster} hideProgressBar />
            <ClusterDetailsButtonGroup cluster={cluster} />
          </CardBody>
        )}
        <CardExpandableContent>
          <CardBody>
            {[
              ClusterStatusEnum.INSTALLED,
              ClusterStatusEnum.INSTALLING,
              ClusterStatusEnum.FINALIZING,
            ].includes(cluster.status) && <FailedHostsWarning cluster={cluster} />}
            {cluster.status === ClusterStatusEnum.ERROR && (
              <ClusterInstallationError
                cluster={cluster}
                setResetClusterModalOpen={setResetClusterModalOpen}
              />
            )}
            {cluster.status === ClusterStatusEnum.CANCELLED && (
              <ClusterInstallationError
                title="Cluster installation was cancelled"
                cluster={cluster}
                setResetClusterModalOpen={setResetClusterModalOpen}
              />
            )}
            <ClusterProgress cluster={cluster} />
            <ClusterDetailsButtonGroup cluster={cluster} />

            {cluster.status === ClusterStatusEnum.INSTALLED && (
              <ClusterCredentials
                cluster={cluster}
                credentials={credentials}
                error={!!credentialsError}
                retry={fetchCredentials}
                idPrefix={getID('cluster-creds')}
              />
            )}
            <div className="vertical-margin">
              <HostsTable cluster={cluster} skipDisabled />
            </div>
          </CardBody>
        </CardExpandableContent>
      </Card>
    </>
  );
};

export default AIClusterDetailsCard;
