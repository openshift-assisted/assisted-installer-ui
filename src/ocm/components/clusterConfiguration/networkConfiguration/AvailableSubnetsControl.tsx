import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Alert, AlertVariant, FormGroup, Stack, StackItem } from '@patternfly/react-core';
import { FieldArray, useFormikContext, FormikHelpers } from 'formik';
import { Address4, Address6 } from 'ip-address';

import {
  Cluster,
  MachineNetwork,
  HostSubnet,
  NetworkConfigurationValues,
  DUAL_STACK,
  NO_SUBNET_SET,
} from '../../../../common';
import { selectCurrentClusterPermissionsState } from '../../../selectors';
import { OcmSelectField } from '../../ui/OcmFormFields';

const subnetSort = (subA: HostSubnet, subB: HostSubnet) =>
  subA.humanized.localeCompare(subB.humanized);

const toFormSelectOptions = (subnets: HostSubnet[]) => {
  return subnets.map((hn, index) => ({
    label: `${hn.humanized}${hn.isValid ? '' : ' (Invalid network)'}`,
    value: hn.subnet,
    isDisabled: false,
    id: `form-input-hostSubnet-field-option-${index}`,
  }));
};

const makeNoSubnetSelectedOption = (availableSubnets: number) => ({
  label: `Please select a subnet. (${availableSubnets} available)`,
  value: NO_SUBNET_SET,
  isDisabled: true,
  id: 'form-input-hostSubnet-field-option-no-subnet-selected',
});

const noSubnetAvailableOption = {
  label: 'No subnets are currently available',
  value: NO_SUBNET_SET,
  id: 'form-input-hostSubnet-field-option-no-subnet-available',
};

const useAutoSelectSingleAvailableSubnet = (
  autoSelectNetwork: boolean,
  setFieldValue: FormikHelpers<NetworkConfigurationValues>['setFieldValue'],
  cidr: MachineNetwork['cidr'],
  clusterId: string,
) => {
  useEffect(() => {
    if (autoSelectNetwork) {
      setFieldValue('machineNetworks', [{ cidr, clusterId }], true);
    }
  }, [autoSelectNetwork, cidr, clusterId, setFieldValue]);
};

export interface AvailableSubnetsControlProps {
  clusterId: Cluster['id'];
  hostSubnets: HostSubnet[];
  isRequired: boolean;
  isDisabled: boolean;
}

export const AvailableSubnetsControl = ({
  clusterId,
  hostSubnets,
  isRequired = false,
  isDisabled,
}: AvailableSubnetsControlProps) => {
  const { values, errors, setFieldValue } = useFormikContext<NetworkConfigurationValues>();
  const isDualStack = values.stackType === DUAL_STACK;
  const { isViewerMode } = useSelector(selectCurrentClusterPermissionsState);

  const IPv4Subnets = hostSubnets
    .filter((subnet) => Address4.isValid(subnet.subnet))
    .sort(subnetSort);
  const IPv6Subnets = hostSubnets
    .filter((subnet) => Address6.isValid(subnet.subnet))
    .sort(subnetSort);

  const cidr = IPv4Subnets.length >= 1 ? IPv4Subnets[0].subnet : NO_SUBNET_SET;
  const hasEmptySelection = (values.machineNetworks ?? []).length === 0;
  const autoSelectNetwork = !isViewerMode && hasEmptySelection;
  useAutoSelectSingleAvailableSubnet(autoSelectNetwork, setFieldValue, cidr, clusterId);

  const buildOptions = React.useMemo(
    () => (machineSubnets: HostSubnet[]) => {
      return machineSubnets.length === 0
        ? [noSubnetAvailableOption]
        : [makeNoSubnetSelectedOption(machineSubnets.length)].concat(
            toFormSelectOptions(machineSubnets),
          );
    },
    [],
  );
  return (
    <FormGroup
      label="Machine network"
      labelInfo={isDualStack && 'Primary'}
      fieldId="machine-networks"
      isRequired
    >
      <FieldArray name="machineNetworks">
        {() => (
          <Stack>
            {isDualStack ? (
              values.machineNetworks?.map((_machineNetwork, index) => {
                const machineSubnets = index === 1 ? IPv6Subnets : IPv4Subnets;
                return (
                  <StackItem key={index}>
                    <OcmSelectField
                      name={`machineNetworks.${index}.cidr`}
                      options={buildOptions(machineSubnets)}
                      isRequired={isRequired}
                      isDisabled={isDisabled}
                    />
                  </StackItem>
                );
              })
            ) : (
              <StackItem>
                <OcmSelectField
                  name={`machineNetworks.0.cidr`}
                  options={buildOptions(IPv4Subnets)}
                  isRequired={isRequired}
                  isDisabled={isDisabled}
                />
              </StackItem>
            )}
          </Stack>
        )}
      </FieldArray>

      {typeof errors.machineNetworks === 'string' && (
        <Alert variant={AlertVariant.warning} title={errors.machineNetworks} isInline />
      )}
    </FormGroup>
  );
};
