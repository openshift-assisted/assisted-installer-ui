import React from 'react';
import { Cluster, Host, HostStatus, ValidationInfoActionProps } from '../../../common';
import { ValidationsInfo } from '../../../common/types/hosts';
import { HostNetworkingStatusComponentProps } from '../../../common/components/hosts/NetworkingHostsTable';
import { AdditionalNTPSourcesDialogToggle } from './AdditionalNTPSourcesDialogToggle';

const NetworkingStatus: React.FC<HostNetworkingStatusComponentProps & { cluster: Cluster }> = ({
  cluster,
  ...props
}) => {
  const networkingStatus: Host['status'] = 'discovering'; // TODO(mlibra)
  const validationsInfo: ValidationsInfo = {};
  const sublabel = undefined;

  const AdditionalNTPSourcesDialogToggleWithCluster: ValidationInfoActionProps['AdditionalNTPSourcesDialogToggleComponent'] = React.useCallback(
    (compProps) => <AdditionalNTPSourcesDialogToggle cluster={cluster} {...compProps} />,
    [cluster],
  );

  return (
    <HostStatus
      {...props}
      statusOverride={networkingStatus}
      validationsInfo={validationsInfo}
      sublabel={sublabel}
      AdditionalNTPSourcesDialogToggleComponent={AdditionalNTPSourcesDialogToggleWithCluster}
    />
  );
};

export default NetworkingStatus;
