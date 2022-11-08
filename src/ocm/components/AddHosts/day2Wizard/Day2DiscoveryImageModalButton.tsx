import React from 'react';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { Cluster } from '../../../../common';
import { useModalDialogsContext } from '../../hosts/ModalDialogsContext';

const Day2DiscoveryImageModalButton = ({ cluster }: { cluster: Cluster }) => {
  const { day2DiscoveryImageDialog } = useModalDialogsContext();
  const { open } = day2DiscoveryImageDialog;

  return (
    <Button
      variant={ButtonVariant.secondary}
      onClick={() => open({ cluster })}
      id={`bare-metal-inventory-add-host-button-download-discovery-iso`}
    >
      Add hosts
    </Button>
  );
};

export default Day2DiscoveryImageModalButton;
