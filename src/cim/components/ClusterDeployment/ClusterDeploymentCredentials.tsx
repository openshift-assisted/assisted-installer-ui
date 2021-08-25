import React from 'react';
import { Cluster } from '../../../common/api/types';
import ClusterCredentials from '../../../common/components/clusterDetail/ClusterCredentials';

type ClusterDeploymentCredentialsProps = {
  cluster: Cluster;
  consoleUrl: string;
  fetchCredentials: (setCredentials: React.Dispatch<React.SetStateAction<{}>>) => void;
};

const ClusterDeploymentCredentials = ({
  cluster,
  consoleUrl,
  fetchCredentials,
}: ClusterDeploymentCredentialsProps) => {
  const [credentials, setCredentials] = React.useState({});

  React.useEffect(() => {
    if (['installed', 'adding-hosts'].includes(cluster.status)) {
      fetchCredentials(setCredentials);
    }
  }, [cluster.status, fetchCredentials]);

  return <ClusterCredentials cluster={cluster} credentials={{ ...credentials, consoleUrl }} />;
};

export default ClusterDeploymentCredentials;
