import React from 'react';
import { AlertActionLink } from '@patternfly/react-core';
import { useModalDialogsContext } from './ModalDialogsContext';
import { HostDetail } from '../../../common/components/hosts/HostRowDetail';
import { ExpandComponentProps } from '../../../common/components/hosts/AITable';
import { Host } from '../../../common/api';

export const AdditionalNTPSourcesDialogToggle: React.FC = () => {
  const {
    additionalNTPSourcesDialog: { open },
  } = useModalDialogsContext();

  return <AlertActionLink onClick={() => open()}>Add NTP sources</AlertActionLink>;
};

export const DefaultExpandComponent: React.FC<ExpandComponentProps<Host>> = ({ obj }) => (
  <HostDetail
    key={obj.id}
    host={obj}
    AdditionalNTPSourcesDialogToggleComponent={AdditionalNTPSourcesDialogToggle}
  />
);
