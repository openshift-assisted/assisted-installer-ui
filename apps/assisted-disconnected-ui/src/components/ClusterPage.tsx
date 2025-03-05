import { SingleClusterPage } from '@openshift-assisted/ui-lib/ocm';
import { useParams } from 'react-router-dom-v5-compat';

const ClusterPage = () => {
  const { clusterId } = useParams() as { clusterId: string };
  return <SingleClusterPage clusterId={clusterId} />;
};

export default ClusterPage;
