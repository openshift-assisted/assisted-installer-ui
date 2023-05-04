import React, { useState } from 'react';
import { Cluster, hostStatus } from '../../../common';
import ClusterHostsTable from '../hosts/ClusterHostsTable';
import { getMostSevereHostStatus } from './utils';
import { ExpandableSection } from '@patternfly/react-core';
import './HostInventoryExpandable.css';

type HostInventoryExpandableProps = {
  cluster: Cluster;
};

const ExpandableSectionTitle = ({
  hostsCount,
  icon,
}: {
  hostsCount: number;
  icon?: React.ReactNode;
}) => (
  <span>
    {`Host inventory ${hostsCount > 0 ? `(${hostsCount})` : ''}`}
    {icon && <span className="pf-u-ml-sm">{icon}</span>}
  </span>
);

const HostInventoryExpandable = ({ cluster }: HostInventoryExpandableProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hosts = cluster.hosts || [];
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment
  const mostSevereHostStatus = getMostSevereHostStatus(hosts);
  const hostStatusDef = mostSevereHostStatus ? hostStatus[mostSevereHostStatus] : null;

  return (
    <ExpandableSection
      toggleContent={
        <ExpandableSectionTitle hostsCount={hosts.length} icon={hostStatusDef?.icon} />
      }
      onToggle={() => setIsExpanded(!isExpanded)}
      isExpanded={isExpanded}
      className="host-inventory-expandable"
      id="host-inventory-expandable"
    >
      <ClusterHostsTable cluster={cluster} skipDisabled />
    </ExpandableSection>
  );
};
export default HostInventoryExpandable;
