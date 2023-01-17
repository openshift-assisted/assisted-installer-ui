import React from 'react';
import { FormGroup, TooltipProps } from '@patternfly/react-core';
import { getFieldId } from '../../../common/components/ui';
import { HostsNetworkConfigurationType } from '../../services/types';
import { useField } from 'formik';
import { useClusterWizardContext } from '../clusterWizard/ClusterWizardContext';
import RadioFieldWithTooltip from '../../../common/components/ui/formik/RadioFieldWithTooltip';
import { clusterExistsReason } from '../featureSupportLevels/featureStateUtils';

export interface HostsNetworkConfigurationControlGroupProps {
  clusterExists: boolean;
}

export const HostsNetworkConfigurationControlGroup = ({
  clusterExists,
}: HostsNetworkConfigurationControlGroupProps) => {
  const GROUP_NAME = 'hostsNetworkConfigurationType';
  const clusterWizardContext = useClusterWizardContext();
  const [{ value }] = useField<HostsNetworkConfigurationType>(GROUP_NAME);

  const tooltipProps: TooltipProps = {
    hidden: !clusterExists,
    content: clusterExistsReason,
    position: 'top',
  };

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
      <RadioFieldWithTooltip
        name={GROUP_NAME}
        isDisabled={clusterExists}
        value={HostsNetworkConfigurationType.DHCP}
        label="DHCP only"
        tooltipProps={tooltipProps}
      />
      <RadioFieldWithTooltip
        name={GROUP_NAME}
        isDisabled={clusterExists}
        value={HostsNetworkConfigurationType.STATIC}
        label="Static IP, bridges, and bonds"
        tooltipProps={tooltipProps}
      />
    </FormGroup>
  );
};
