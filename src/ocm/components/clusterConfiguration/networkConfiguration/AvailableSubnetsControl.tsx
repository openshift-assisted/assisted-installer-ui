import React, { useEffect } from 'react';
import { Alert, AlertVariant, FormGroup, Stack, StackItem } from '@patternfly/react-core';
import { FieldArray, useFormikContext, FormikHelpers } from 'formik';
import { Cluster, MachineNetwork } from '../../../../common/api/types';
import { HostSubnet, HostSubnets, NetworkConfigurationValues } from '../../../../common/types';
import { DUAL_STACK, NO_SUBNET_SET } from '../../../../common/config/constants';
import { SelectField } from '../../../../common/components/ui';
import { Address4, Address6 } from 'ip-address';

const toFormSelectOptions = (subnets: HostSubnet[]) => {
  return subnets
    .sort((subA, subB) => subA.humanized.localeCompare(subB.humanized))
    .map((hn, index) => ({
      label: hn.humanized,
      value: hn.subnet,
      isDisabled: false,
      id: `form-input-hostSubnet-field-option-${index}`,
    }));
};

const makeNoSubnetSelectedOption = (hostSubnets: HostSubnet[]) => ({
  label: `Please select a subnet. (${hostSubnets.length} available)`,
  value: NO_SUBNET_SET,
  isDisabled: true,
  id: 'form-input-hostSubnet-field-option-no-subnet-selected',
});

const makeNoSubnetAvailableOption = () => ({
  label: 'No subnets are currently available',
  value: NO_SUBNET_SET,
  id: 'form-input-hostSubnet-field-option-no-subnet-available',
});

const useAutoSelectSingleAvailableSubnet = (
  hasNoMachineNetworks: boolean,
  setFieldValue: FormikHelpers<NetworkConfigurationValues>['setFieldValue'],
  cidr: MachineNetwork['cidr'],
  clusterId: string,
) => {
  useEffect(() => {
    if (hasNoMachineNetworks) {
      setFieldValue('machineNetworks', [{ cidr, clusterId }], true);
    }
  }, [hasNoMachineNetworks, cidr, clusterId, setFieldValue]);
};

export interface AvailableSubnetsControlProps {
  clusterId: Cluster['id'];
  hostSubnets: HostSubnets;
  isRequired: boolean;
}

export const AvailableSubnetsControl = ({
  clusterId,
  hostSubnets,
  isRequired = false,
}: AvailableSubnetsControlProps) => {
  const { values, errors, setFieldValue } = useFormikContext<NetworkConfigurationValues>();
  const isDualStack = values.stackType === DUAL_STACK;

  const IPv4Subnets = hostSubnets.filter((subnet) => Address4.isValid(subnet.subnet));
  const IPv6Subnets = hostSubnets.filter((subnet) => Address6.isValid(subnet.subnet));

  const hasNoMachineNetworks = (values.machineNetworks ?? []).length === 0;
  const cidr = hostSubnets.length >= 1 ? hostSubnets[0].subnet : NO_SUBNET_SET;
  useAutoSelectSingleAvailableSubnet(hasNoMachineNetworks, setFieldValue, cidr, clusterId);

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
                return (
                  <StackItem key={index}>
                    <SelectField
                      name={`machineNetworks.${index}.cidr`}
                      options={
                        (index === 1 ? IPv6Subnets.length > 0 : IPv4Subnets.length > 0)
                          ? [makeNoSubnetSelectedOption(hostSubnets)].concat(
                              toFormSelectOptions(index === 1 ? IPv6Subnets : IPv4Subnets),
                            )
                          : [makeNoSubnetAvailableOption()]
                      }
                      isDisabled={!hostSubnets.length}
                      isRequired={isRequired}
                    />
                  </StackItem>
                );
              })
            ) : (
              <StackItem>
                <SelectField
                  isDisabled={!hostSubnets.length}
                  isRequired={isRequired}
                  name={`machineNetworks.0.cidr`}
                  options={
                    IPv4Subnets.length === 0
                      ? [makeNoSubnetAvailableOption()]
                      : [makeNoSubnetSelectedOption(hostSubnets)].concat(
                          toFormSelectOptions(IPv4Subnets),
                        )
                  }
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
