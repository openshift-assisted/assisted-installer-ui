import React from 'react';
import { Cluster, hostStatus } from '../../../common';
import ExpandableCard from '../ui/ExpandableCard';
import ClusterHostsTable from '../hosts/ClusterHostsTable';
import { getMostSevereHostStatus } from './utils';

type HostInventoryProps = {
  cluster: Cluster;
};

const HostInventory = ({ cluster }: HostInventoryProps) => {
  const mostSevereHostStatus = getMostSevereHostStatus(cluster.hosts || []);
  const title = (
    <span>
      {`Host Inventory ${cluster.hosts?.length && `(${cluster.hosts.length})`}`}
      {mostSevereHostStatus !== null && (
        <span className="pf-u-ml-xs">{hostStatus[mostSevereHostStatus].icon}</span>
      )}
    </span>
  );
  return (
    <ExpandableCard id="cluster-host-table" title={title} defaultIsExpanded={false}>
      <ClusterHostsTable cluster={cluster} skipDisabled />
    </ExpandableCard>
  );
};
export default HostInventory;
