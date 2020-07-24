import React from 'react';
import { Button, ButtonVariant } from '@patternfly/react-core';
import EditHostModal from './EditHostModal';
import { Host, Inventory, Cluster } from '../../api/types';

type HostnameProps = {
  host: Host;
  inventory: Inventory;
  cluster: Cluster;
};

export const computeHostname = (host: Host, inventory: Inventory) =>
  host.requestedHostname || inventory.hostname;

const Hostname: React.FC<HostnameProps> = ({ host, inventory, cluster }) => {
  const [isOpen, setOpen] = React.useState(false);

  const hostname = computeHostname(host, inventory);
  const isHostnameChangeRequested = host.requestedHostname !== inventory.hostname;

  return (
    <>
      <Button variant={ButtonVariant.link} isInline onClick={() => setOpen(true)}>
        {hostname}
        {isHostnameChangeRequested && ' *'}
      </Button>
      <EditHostModal
        host={host}
        inventory={inventory}
        cluster={cluster}
        onClose={() => setOpen(false)}
        isOpen={isOpen}
        onSave={() => setOpen(false)}
      />
    </>
  );
};
export default Hostname;
