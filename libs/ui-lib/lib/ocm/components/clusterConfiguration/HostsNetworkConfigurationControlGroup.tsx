import React from 'react';
import { FormGroup, TooltipProps } from '@patternfly/react-core';
import { getFieldId } from '../../../common/components/ui';
import { HostsNetworkConfigurationType } from '../../services/types';
import { useField } from 'formik';
import { useClusterWizardContext } from '../clusterWizard/ClusterWizardContext';
import RadioFieldWithTooltip from '../../../common/components/ui/formik/RadioFieldWithTooltip';
import {
  clusterExistsReason,
  hostsNetworkConfigurationDisabledReason,
} from '../featureSupportLevels/featureStateUtils';

export interface HostsNetworkConfigurationControlGroupProps {
  clusterExists: boolean;
  isDisabled: boolean;
}

export const HostsNetworkConfigurationControlGroup = ({
  clusterExists,
  isDisabled = false,
}: HostsNetworkConfigurationControlGroupProps) => {
  const GROUP_NAME = 'hostsNetworkConfigurationType';
  const clusterWizardContext = useClusterWizardContext();
  const [{ value }] = useField<HostsNetworkConfigurationType>(GROUP_NAME);
  const fieldId = getFieldId(GROUP_NAME, 'radio');
  const tooltipProps: TooltipProps = {
    hidden: !clusterExists && !isDisabled,
    content: !isDisabled ? clusterExistsReason : hostsNetworkConfigurationDisabledReason,
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
      id={`form-control__${fieldId}`}
      label="Hosts' network configuration"
      fieldId={fieldId}
      isInline
      role="radiogroup"
    >
      <RadioFieldWithTooltip
        name={GROUP_NAME}
        isDisabled={clusterExists || isDisabled}
        value={HostsNetworkConfigurationType.DHCP}
        label="DHCP only"
        tooltipProps={tooltipProps}
        className="pf-v6-u-mr-md"
      />
      <RadioFieldWithTooltip
        name={GROUP_NAME}
        isDisabled={clusterExists || isDisabled}
        value={HostsNetworkConfigurationType.STATIC}
        label="Static IP, bridges, and bonds"
        tooltipProps={tooltipProps}
      />
    </FormGroup>
  );
};
