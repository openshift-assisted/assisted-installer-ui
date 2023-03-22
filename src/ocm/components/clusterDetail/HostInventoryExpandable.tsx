import React from 'react';
import { Cluster, hostStatus } from '../../../common';
import ExpandableCard from '../ui/ExpandableCard';
import ClusterHostsTable from '../hosts/ClusterHostsTable';
import { getMostSevereHostStatus } from './utils';

type HostInventoryExpandableProps = {
  cluster: Cluster;
};

const HostInventoryExpandable = ({ cluster }: HostInventoryExpandableProps) => {
  const hosts = cluster.hosts || [];
  const mostSevereHostStatus = getMostSevereHostStatus(hosts);
  const title = (
    <span>
      {`Host inventory ${hosts.length > 0 ? `(${hosts.length})` : ''}`}
      {mostSevereHostStatus !== null && (
        <span className="pf-u-ml-sm">{hostStatus[mostSevereHostStatus].icon}</span>
      )}
    </span>
  );
  return (
    <ExpandableCard id="cluster-host-table" title={title} defaultIsExpanded={false}>
      <ClusterHostsTable cluster={cluster} skipDisabled />
    </ExpandableCard>
  );
};
export default HostInventoryExpandable;
