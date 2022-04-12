import React from 'react';
import { AlertActionLink } from '@patternfly/react-core';
import { useModalDialogsContext } from './ModalDialogsContext';

export const UpdateDay2ApiVipDialogToggle: React.FC = () => {
  const {
    UpdateDay2ApiVipDialog: { open },
  } = useModalDialogsContext();

  return <AlertActionLink onClick={() => open()}>Update cluster with API IP</AlertActionLink>;
};
