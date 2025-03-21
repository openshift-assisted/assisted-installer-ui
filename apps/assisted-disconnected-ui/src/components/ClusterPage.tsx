import { SingleClusterPage } from '@openshift-assisted/ui-lib/ocm';
import { useParams } from 'react-router-dom-v5-compat';
import ResetSingleClusterModal from './ResetSingleClusterModal';

const ClusterPage = () => {
  const { clusterId } = useParams() as { clusterId: string };
  return <SingleClusterPage clusterId={clusterId} resetModal={<ResetSingleClusterModal />} />;
};

export default ClusterPage;
