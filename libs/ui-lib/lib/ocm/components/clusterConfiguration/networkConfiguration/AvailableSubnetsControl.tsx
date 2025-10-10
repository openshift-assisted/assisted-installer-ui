import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Alert, AlertVariant, FormGroup, Stack, StackItem } from '@patternfly/react-core';
import { FieldArray, useFormikContext, FormikHelpers } from 'formik';
import { Address4, Address6 } from 'ip-address';

import {
  HostSubnet,
  NetworkConfigurationValues,
  DUAL_STACK,
  NO_SUBNET_SET,
  isMajorMinorVersionEqualOrGreater,
} from '../../../../common';
import { selectCurrentClusterPermissionsState } from '../../../store/slices/current-cluster/selectors';
import { SubnetsDropdown } from './SubnetsDropdown';
import { Cluster, MachineNetwork } from '@openshift-assisted/types/assisted-installer-service';

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
  openshiftVersion?: string;
}

export const AvailableSubnetsControl = ({
  clusterId,
  hostSubnets,
  isRequired = false,
  isDisabled,
  openshiftVersion,
}: AvailableSubnetsControlProps) => {
  const { values, errors, setFieldValue } = useFormikContext<NetworkConfigurationValues>();
  const isDualStack = values.stackType === DUAL_STACK;
  const { isViewerMode } = useSelector(selectCurrentClusterPermissionsState);

  // Check if OCP version supports IPv6 as primary network
  const supportsIPv6Primary =
    openshiftVersion && isMajorMinorVersionEqualOrGreater(openshiftVersion, '4.12');

  const IPv4Subnets = hostSubnets
    .filter((subnet) => Address4.isValid(subnet.subnet))
    .sort(subnetSort);
  const IPv6Subnets = hostSubnets
    .filter((subnet) => Address6.isValid(subnet.subnet))
    .sort(subnetSort);

  // For OCP >= 4.12, both networks can use either IPv4 or IPv6
  const allSubnets = supportsIPv6Primary
    ? [...IPv4Subnets, ...IPv6Subnets].sort(subnetSort)
    : IPv4Subnets;

  const cidr = allSubnets.length >= 1 ? allSubnets[0].subnet : NO_SUBNET_SET;
  const hasEmptySelection = (values.machineNetworks ?? []).length === 0;
  const autoSelectNetwork = !isViewerMode && hasEmptySelection;
  useAutoSelectSingleAvailableSubnet(autoSelectNetwork, setFieldValue, cidr, clusterId);

  return (
    <FormGroup
      label="Machine network"
      labelInfo={isDualStack && (supportsIPv6Primary ? 'Primary (IPv4 or IPv6)' : 'Primary')}
      fieldId="machine-networks"
      isRequired={isRequired}
    >
      <FieldArray name="machineNetworks">
        {() => (
          <Stack>
            {isDualStack ? (
              values.machineNetworks?.map((machineNetwork, index) => {
                let machineSubnets;

                if (supportsIPv6Primary) {
                  // For OCP >= 4.12, smart filtering based on the other network's selection
                  if (index === 0) {
                    // First network: show all subnets
                    machineSubnets = allSubnets;
                  } else {
                    // Second network: show opposite type of what's selected in first network
                    const firstNetworkCidr = values.machineNetworks?.[0]?.cidr;
                    if (firstNetworkCidr && Address6.isValid(firstNetworkCidr)) {
                      // If first is IPv6, second should be IPv4
                      machineSubnets = IPv4Subnets;
                    } else if (firstNetworkCidr && Address4.isValid(firstNetworkCidr)) {
                      // If first is IPv4, second should be IPv6
                      machineSubnets = IPv6Subnets;
                    } else {
                      // If first is not selected yet, show all subnets
                      machineSubnets = allSubnets;
                    }
                  }
                } else {
                  // For older versions, first network is IPv4, second is IPv6
                  machineSubnets = index === 1 ? IPv6Subnets : IPv4Subnets;
                }

                return (
                  <StackItem key={index}>
                    <SubnetsDropdown
                      name={`machineNetworks.${index}.cidr`}
                      machineSubnets={machineSubnets}
                      isDisabled={isDisabled}
                      data-testid={`subnets-dropdown-toggle-${index ? 'ipv6' : 'ipv4'}`}
                    />
                  </StackItem>
                );
              })
            ) : (
              <StackItem>
                <SubnetsDropdown
                  name={`machineNetworks.0.cidr`}
                  machineSubnets={supportsIPv6Primary ? allSubnets : IPv4Subnets}
                  isDisabled={isDisabled}
                  data-testid={'subnets-dropdown-toggle-ipv4'}
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
