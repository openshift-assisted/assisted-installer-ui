import React from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentCluster } from '../../store/slices/current-cluster/selectors';
import { AddHostsContext } from '../../../common/components/AddHosts/AddHostsContext';

export const NtpSyncFailureMessage = () => {
  const reduxCluster = useSelector(selectCurrentCluster);
  const { cluster: day2Cluster } = React.useContext(AddHostsContext);
  const cluster = day2Cluster || reduxCluster;

  if (cluster?.ntpSources?.trim()) {
    return (
      <>
        This cluster replaces default NTP sources with a custom list. To update the list, change NTP
        sources in the Add hosts dialog, generate a new discovery ISO, and reboot discovery hosts.
      </>
    );
  }

  return <>Manually fix the host's NTP configuration or provide additional NTP sources.</>;
};
