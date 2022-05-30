import React from 'react';
import { FormGroup } from '@patternfly/react-core';
import { getFieldId, RadioField } from '../../../common/components/ui';
import { HostsNetworkConfigurationType } from '../../services/types';
import { useField } from 'formik';
import { useClusterWizardContext } from '../clusterWizard/ClusterWizardContext';
export interface HostsNetworkConfigurationControlGroupProps {
  clusterExists: boolean;
}

export const HostsNetworkConfigurationControlGroup = ({
  clusterExists,
}: HostsNetworkConfigurationControlGroupProps) => {
  const GROUP_NAME = 'hostsNetworkConfigurationType';
  const clusterWizardContext = useClusterWizardContext();
  const [{ value }, ,] = useField(GROUP_NAME);
  React.useEffect(() => {
    if (clusterExists) {
      return;
    }
    clusterWizardContext.onUpdateHostNetworkConfigType(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, clusterExists]);
  return (
    <FormGroup
      label="Hosts' network configuration"
      fieldId={getFieldId(GROUP_NAME, 'radio')}
      isInline
    >
      <RadioField
        name={GROUP_NAME}
        isDisabled={clusterExists}
        value={HostsNetworkConfigurationType.DHCP}
        label="DHCP server"
      />
      <RadioField
        name={GROUP_NAME}
        isDisabled={clusterExists}
        value={HostsNetworkConfigurationType.STATIC}
        label="Static network configuration"
      />
    </FormGroup>
  );
};
