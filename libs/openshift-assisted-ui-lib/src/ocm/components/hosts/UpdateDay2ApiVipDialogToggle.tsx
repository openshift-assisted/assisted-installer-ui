import React from 'react';
import { AlertActionLink } from '@patternfly/react-core';
import { useModalDialogsContext } from './ModalDialogsContext';

export const UpdateDay2ApiVipDialogToggle: React.FC = () => {
  const {
    UpdateDay2ApiVipDialog: { open },
  } = useModalDialogsContext();

  return (
    <>
      Check your DNS and network configuration, or{' '}
      <AlertActionLink onClick={() => open()} isInline>
        set the IP or domain used to reach the cluster.
      </AlertActionLink>
    </>
  );
};
