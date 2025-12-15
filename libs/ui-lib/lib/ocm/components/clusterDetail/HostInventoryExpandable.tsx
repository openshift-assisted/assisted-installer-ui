import React, { useState } from 'react';
import { UiIcon, hostStatus } from '../../../common';
import ClusterHostsTable from '../hosts/ClusterHostsTable';
import { getHostsWithTimeout, getMostSevereHostStatus } from './utils';
import { ExpandableSection } from '@patternfly/react-core';
import './HostInventoryExpandable.css';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';

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
    {icon && <span className="pf-v6-u-ml-sm">{icon}</span>}
  </span>
);

const HostInventoryExpandable = ({ cluster }: HostInventoryExpandableProps) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const hosts = cluster.hosts || [];
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment
  const mostSevereHostStatus = getMostSevereHostStatus(hosts);
  const hostStatusDef = mostSevereHostStatus ? hostStatus(t)[mostSevereHostStatus] : null;
  const someHostHasTimeout = getHostsWithTimeout(hosts);
  const warningIcon = <UiIcon size="sm" status="warning" icon={<ExclamationTriangleIcon />} />;
  return (
    <ExpandableSection
      toggleContent={
        <ExpandableSectionTitle
          hostsCount={hosts.length}
          icon={someHostHasTimeout ? warningIcon : hostStatusDef?.icon}
        />
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
