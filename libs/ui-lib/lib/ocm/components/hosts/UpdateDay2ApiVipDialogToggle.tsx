import React from 'react';
import { AlertActionLink } from '@patternfly/react-core';
import { useModalDialogsContext } from './ModalDialogsContext';
import { AddHostsContext } from '../../../common';

export const UpdateDay2ApiVipDialogToggle: React.FC = () => {
  const {
    UpdateDay2ApiVipDialog: { open },
  } = useModalDialogsContext();
  const { canEdit } = React.useContext(AddHostsContext);

  return (
    <>
      Check your DNS and network configuration, or{' '}
      {canEdit ? (
        <AlertActionLink onClick={() => open()} isInline>
          set the IP or domain used to reach the cluster.
        </AlertActionLink>
      ) : (
        'set the IP or domain used to reach the cluster.'
      )}
    </>
  );
};
