import React, { useState } from 'react';
import { Cluster, hostStatus } from '../../../common';
import ClusterHostsTable from '../hosts/ClusterHostsTable';
import { getMostSevereHostStatus } from './utils';
import { ExpandableSection } from '@patternfly/react-core';
import './HostInventoryExpandable.css';

type HostInventoryExpandableProps = {
  cluster: Cluster;
};

const HostInventoryExpandable = ({ cluster }: HostInventoryExpandableProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
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
    <ExpandableSection
      toggleContent={title}
      onToggle={() => setIsExpanded(!isExpanded)}
      isExpanded={isExpanded}
      className="host-inventory-expandable"
    >
      <ClusterHostsTable cluster={cluster} skipDisabled />
    </ExpandableSection>
  );
};
export default HostInventoryExpandable;
