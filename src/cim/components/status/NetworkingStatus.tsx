import * as React from 'react';
import { Host, HostStatus } from '../../../common';
import { HostStatusProps } from '../../../common/components/hosts/types';
import { ValidationsInfo } from '../../../common/types/hosts';
import { AdditionalNTPSourcesDialogToggle } from '../ClusterDeployment/AdditionalNTPSourcesDialogToggle';

type HostNetworkingStatusComponentProps = {
  host: Host;
  statusOverride: HostStatusProps['statusOverride'];
  validationsInfo: ValidationsInfo;
  sublabel: string | undefined;
  onEditHostname?: () => void;
};

const NetworkingStatus: React.FC<HostNetworkingStatusComponentProps> = (props) => (
  <HostStatus
    {...props}
    AdditionalNTPSourcesDialogToggleComponent={AdditionalNTPSourcesDialogToggle}
  />
);

export default NetworkingStatus;
