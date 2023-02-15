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
import { SubnetsDropdown } from './SubnetsDropdown';

const subnetSort = (subA: HostSubnet, subB: HostSubnet) =>
  subA.humanized.localeCompare(subB.humanized);

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

  return (
    <FormGroup
      label="Machine network"
      labelInfo={isDualStack && 'Primary'}
      fieldId="machine-networks"
      isRequired={isRequired}
    >
      <FieldArray name="machineNetworks">
        {() => (
          <Stack>
            {isDualStack ? (
              values.machineNetworks?.map((_machineNetwork, index) => {
                const machineSubnets = index === 1 ? IPv6Subnets : IPv4Subnets;

                return (
                  <StackItem key={index}>
                    <SubnetsDropdown
                      name={`machineNetworks.${index}.cidr`}
                      machineSubnets={machineSubnets}
                      isDisabled={isDisabled}
                    />
                  </StackItem>
                );
              })
            ) : (
              <StackItem>
                <SubnetsDropdown
                  name={`machineNetworks.0.cidr`}
                  machineSubnets={IPv4Subnets}
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
