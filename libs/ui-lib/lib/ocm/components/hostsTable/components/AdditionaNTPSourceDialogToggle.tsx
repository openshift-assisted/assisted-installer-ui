import React from 'react';
import { AlertActionLink } from '@patternfly/react-core';
import { useModalDialogsContext } from '../modals/ModalDialogsContext';
import { useSelector } from 'react-redux';
import { selectCurrentCluster } from '../../../store/slices/current-cluster/selectors';
import { AddHostsContext } from '../../../../common';

export const AdditionalNTPSourcesDialogToggle = () => {
  const {
    additionalNTPSourcesDialog: { open },
  } = useModalDialogsContext();

  const reduxCluster = useSelector(selectCurrentCluster);
  const { cluster: day2Cluster } = React.useContext(AddHostsContext);
  const cluster = day2Cluster || reduxCluster;

  if (cluster?.ntpSources?.trim()) {
    return null;
  }

  return <AlertActionLink onClick={() => open()}>Add NTP sources</AlertActionLink>;
};
