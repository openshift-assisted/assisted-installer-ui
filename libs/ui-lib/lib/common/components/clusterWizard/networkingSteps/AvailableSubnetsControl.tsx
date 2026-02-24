import React, { useEffect } from 'react';
import {
  Alert,
  AlertActionLink,
  AlertVariant,
  FormGroup,
  Popover,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { FieldArray, useFormikContext, FormikHelpers } from 'formik';
import { Address4, Address6 } from 'ip-address';

import { HostSubnet, NetworkConfigurationValues } from '../../../types';
import { DUAL_STACK, NO_SUBNET_SET } from '../../../config';
import { isMajorMinorVersionEqualOrGreater } from '../../../utils';
import { useTranslation } from '../../../hooks/use-translation-wrapper';
import { SubnetsDropdown } from './SubnetsDropdown';
import { reorderNetworksForPrimary } from './reorderNetworks';
import {
  Cluster,
  Host,
  MachineNetwork,
} from '@openshift-assisted/types/assisted-installer-service';

const subnetSort = (subA: HostSubnet, subB: HostSubnet) =>
  subA.humanized.localeCompare(subB.humanized);

const useAutoSelectDefaultMachineNetworks = (
  autoSelectNetwork: boolean,
  setFieldValue: FormikHelpers<NetworkConfigurationValues>['setFieldValue'],
  cidrV4: MachineNetwork['cidr'],
  cidrV6: MachineNetwork['cidr'],
  clusterId: string,
  isDualStack: boolean,
) => {
  useEffect(() => {
    if (autoSelectNetwork) {
      setFieldValue(
        'machineNetworks',
        isDualStack
          ? [
              { cidr: cidrV4, clusterId },
              { cidr: cidrV6, clusterId },
            ]
          : [{ cidr: cidrV4, clusterId }],
        false,
      );
    }
  }, [autoSelectNetwork, cidrV4, cidrV6, clusterId, isDualStack, setFieldValue]);
};

export interface AvailableSubnetsControlProps {
  clusterId: Cluster['id'];
  hostSubnets: HostSubnet[];
  isRequired: boolean;
  isDisabled: boolean;
  openshiftVersion?: string;
  isViewerMode?: boolean;
  hosts?: Host[];
  isMultiNodeCluster?: boolean;
  /** When true (CIM), single-stack machine network dropdown shows both IPv4 and IPv6 subnets. */
  allowSingleStackIPv6?: boolean;
}

export const AvailableSubnetsControl = ({
  clusterId,
  hostSubnets,
  isRequired = false,
  isDisabled,
  openshiftVersion,
  isViewerMode = false,
  hosts,
  isMultiNodeCluster = true,
  allowSingleStackIPv6 = false,
}: AvailableSubnetsControlProps) => {
  const { t } = useTranslation();
  const { values, errors, setFieldValue } = useFormikContext<NetworkConfigurationValues>();
  const isDualStack = values.stackType === DUAL_STACK;

  // Check if OCP version supports IPv6 as primary network
  const supportsIPv6Primary =
    openshiftVersion && isMajorMinorVersionEqualOrGreater(openshiftVersion, '4.12');

  const IPv4Subnets = hostSubnets
    .filter((subnet) => Address4.isValid(subnet.subnet))
    .sort(subnetSort);
  const IPv6Subnets = hostSubnets
    .filter((subnet) => Address6.isValid(subnet.subnet))
    .sort(subnetSort);

  const allSubnets =
    supportsIPv6Primary || allowSingleStackIPv6
      ? [...IPv4Subnets, ...IPv6Subnets].sort(subnetSort)
      : IPv4Subnets;

  // For auto-selection, prefer IPv4 as primary (even for dual-stack)
  const cidrV4 = IPv4Subnets.length >= 1 ? IPv4Subnets[0].subnet : NO_SUBNET_SET;
  const cidrV6 = IPv6Subnets.length >= 1 ? IPv6Subnets[0].subnet : NO_SUBNET_SET;
  const hasEmptySelection = (values.machineNetworks ?? []).length === 0;
  const autoSelectNetwork = !isViewerMode && hasEmptySelection;
  useAutoSelectDefaultMachineNetworks(
    autoSelectNetwork,
    setFieldValue,
    cidrV4,
    cidrV6,
    clusterId,
    isDualStack,
  );

  // Ensure primary and secondary machine networks are not in the same stack (IPv4/IPv6).
  // If the user switches primary to the same address family as secondary, adjust secondary to the opposite family
  // (or clear it if no subnet is available).
  React.useEffect(() => {
    if (!isDualStack) {
      return;
    }
    if (!values.machineNetworks || values.machineNetworks.length < 2) {
      return;
    }
    const first = values.machineNetworks?.[0]?.cidr || '';
    const second = values.machineNetworks?.[1]?.cidr || '';
    if (!first || !second) {
      return;
    }

    const firstIsV4 = Address4.isValid(first);
    const firstIsV6 = Address6.isValid(first);
    const secondIsV4 = Address4.isValid(second);
    const secondIsV6 = Address6.isValid(second);

    // If both are the same family, force the secondary to the opposite family.
    if ((firstIsV4 && secondIsV4) || (firstIsV6 && secondIsV6)) {
      const replacement = firstIsV4
        ? IPv6Subnets[0]?.subnet ?? NO_SUBNET_SET
        : IPv4Subnets[0]?.subnet ?? NO_SUBNET_SET;

      if (replacement !== second) {
        setFieldValue('machineNetworks.1.cidr', replacement, false);
      }
    }
  }, [isDualStack, values.machineNetworks, IPv4Subnets, IPv6Subnets, setFieldValue]);

  // Helper text showing excluded hosts
  const getExcludedHostsAlert = React.useCallback(
    (subnetCidr: string | undefined) => {
      if (!hosts || !isMultiNodeCluster || !subnetCidr) {
        return null;
      }
      const matchingSubnet = hostSubnets.find((hn) => hn.subnet === subnetCidr);
      if (!matchingSubnet) {
        return null;
      }

      const excludedHosts =
        hosts.filter(
          (host) =>
            !['disabled', 'disconnected'].includes(host.status) &&
            !matchingSubnet.hostIDs.includes(host.requestedHostname || ''),
        ) || [];

      // Workaround for bug in CIM backend. hostIDs are empty
      if (excludedHosts.length === 0 || !matchingSubnet.hostIDs.length) {
        return null;
      }

      const actionLinks = (
        <Popover
          position="right"
          bodyContent={
            <ul>
              {excludedHosts
                .sort(
                  (hostA, hostB) =>
                    hostA.requestedHostname?.localeCompare(hostB.requestedHostname || '') || 0,
                )
                .map((host) => (
                  <li key={host.id}>{host.requestedHostname || host.id}</li>
                ))}
            </ul>
          }
          minWidth="30rem"
          maxWidth="50rem"
        >
          <AlertActionLink id="form-input-hostSubnet-field-helper-view-excluded">
            {t('ai:View {{count}} affected host', {
              count: excludedHosts.length,
            })}
          </AlertActionLink>
        </Popover>
      );

      return (
        <Alert
          title={t('ai:This subnet range is not available on all hosts')}
          variant={AlertVariant.warning}
          actionLinks={actionLinks}
          isInline
        >
          {t('ai:Hosts outside of this range will not be included in the new cluster.')}
        </Alert>
      );
    },
    [hosts, isMultiNodeCluster, hostSubnets, t],
  );

  const primaryNetworkCidr = values.machineNetworks?.[0]?.cidr;
  const excludedHostsAlert = getExcludedHostsAlert(primaryNetworkCidr);
  const showSecondaryMachineNetwork =
    isDualStack && values.machineNetworks && values.machineNetworks.length > 1;

  // Determine available subnets for primary dropdown
  let primaryMachineSubnets: HostSubnet[];
  if ((isDualStack && supportsIPv6Primary) || (!isDualStack && allowSingleStackIPv6)) {
    primaryMachineSubnets = allSubnets;
  } else {
    primaryMachineSubnets = IPv4Subnets;
  }

  // Determine available subnets for secondary dropdown
  const secondaryMachineSubnets = React.useMemo(() => {
    if (supportsIPv6Primary) {
      // For OCP >= 4.12, smart filtering based on the other network's selection
      if (primaryNetworkCidr && Address6.isValid(primaryNetworkCidr)) {
        // If first is IPv6, second should be IPv4
        return IPv4Subnets;
      } else if (primaryNetworkCidr && Address4.isValid(primaryNetworkCidr)) {
        // If first is IPv4, second should be IPv6
        return IPv6Subnets;
      } else {
        // If first is not selected yet, show all subnets
        return allSubnets;
      }
    } else {
      // For older versions, second network is IPv6
      return IPv6Subnets;
    }
  }, [supportsIPv6Primary, primaryNetworkCidr, IPv4Subnets, IPv6Subnets, allSubnets]);

  return (
    <>
      <FormGroup
        label="Machine network"
        labelInfo={isDualStack && 'Primary'}
        fieldId="machine-networks"
        isRequired={isRequired}
      >
        <FieldArray name="machineNetworks">
          {() => (
            <Stack>
              <StackItem>
                <SubnetsDropdown
                  name="machineNetworks.0.cidr"
                  machineSubnets={primaryMachineSubnets}
                  isDisabled={isDisabled}
                  onAfterSelect={(newSelection) =>
                    reorderNetworksForPrimary(newSelection, values, setFieldValue)
                  }
                  data-testid="subnets-dropdown-toggle-primary"
                />
              </StackItem>
            </Stack>
          )}
        </FieldArray>
      </FormGroup>

      {/* Secondary machine network */}
      {showSecondaryMachineNetwork && (
        <FormGroup
          label="Machine network"
          labelInfo="Secondary"
          fieldId="machine-networks-secondary"
          isRequired={isRequired}
        >
          <SubnetsDropdown
            name="machineNetworks.1.cidr"
            machineSubnets={secondaryMachineSubnets}
            isDisabled={isDisabled}
            data-testid="subnets-dropdown-toggle-secondary"
          />
        </FormGroup>
      )}
      <>
        {typeof errors.machineNetworks === 'string' && (
          <Alert variant={AlertVariant.warning} title={errors.machineNetworks} isInline />
        )}
        {excludedHostsAlert}
      </>
    </>
  );
};
