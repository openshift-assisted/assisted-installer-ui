import React from 'react';
import { useSelector } from 'react-redux';
import { ButtonVariant, FormGroup, Split, SplitItem, Tooltip } from '@patternfly/react-core';
import { useFormikContext } from 'formik';
import { Address4, Address6 } from 'ip-address';

import {
  HostSubnets,
  NetworkConfigurationValues,
  getFieldId,
  DUAL_STACK,
  IPV4_STACK,
  NETWORK_TYPE_OVN,
  NETWORK_TYPE_SDN,
  NO_SUBNET_SET,
} from '../../../../common';
import { ConfirmationModal, PopoverIcon } from '../../../../common/components/ui';
import { useDefaultConfiguration } from '../ClusterDefaultConfigurationContext';
import { selectCurrentClusterPermissionsState } from '../../../store/slices/current-cluster/selectors';
import { OcmRadioField } from '../../ui/OcmFormFields';
import {
  Cluster,
  ClusterNetwork,
  MachineNetwork,
  ServiceNetwork,
} from '@openshift-assisted/types/assisted-installer-service';

type StackTypeControlGroupProps = {
  clusterId: Cluster['id'];
  isDualStackSelectable: boolean;
  hostSubnets: HostSubnets;
};

const hasDualStackConfigurationChanged = (
  clusterNetworks: ClusterNetwork[],
  serviceNetworks: ServiceNetwork[],
  cidrIPv6: MachineNetwork['cidr'],
  values: NetworkConfigurationValues,
) =>
  clusterNetworks &&
  serviceNetworks &&
  ((values.machineNetworks && values.machineNetworks[1].cidr !== cidrIPv6) ||
    (values.clusterNetworks && values.clusterNetworks[1].cidr !== clusterNetworks[1].cidr) ||
    (values.clusterNetworks &&
      values.clusterNetworks[1].hostPrefix !== clusterNetworks[1].hostPrefix) ||
    (values.serviceNetworks && values.serviceNetworks[1].cidr !== serviceNetworks[1].cidr));

export const StackTypeControlGroup = ({
  clusterId,
  isDualStackSelectable,
  hostSubnets,
}: StackTypeControlGroupProps) => {
  const { setFieldValue, values, validateForm } = useFormikContext<NetworkConfigurationValues>();
  const [openConfirmModal, setConfirmModal] = React.useState(false);
  const defaultNetworkValues = useDefaultConfiguration([
    'clusterNetworksDualstack',
    'clusterNetworksIpv4',
    'serviceNetworksDualstack',
    'serviceNetworksIpv4',
  ]);

  const IPv6Subnets = hostSubnets.filter((subnet) => Address6.isValid(subnet.subnet));
  const cidrIPv6 = IPv6Subnets.length >= 1 ? IPv6Subnets[0].subnet : NO_SUBNET_SET;
  const { isViewerMode } = useSelector(selectCurrentClusterPermissionsState);
  const shouldSetSingleStack =
    !isViewerMode && !isDualStackSelectable && values.stackType === DUAL_STACK;

  const setSingleStack = React.useCallback(() => {
    setFieldValue('stackType', IPV4_STACK);

    if (values.machineNetworks && values.machineNetworks?.length >= 2) {
      // For single-stack IPv4, prefer IPv4 machine network
      const firstNetwork = values.machineNetworks[0];
      const isFirstIPv4 = firstNetwork?.cidr && Address4.isValid(firstNetwork.cidr);

      if (isFirstIPv4) {
        // Keep the first network if it's IPv4
        setFieldValue('machineNetworks', [firstNetwork]);
      } else {
        // If first is IPv6, look for IPv4 network or set empty for auto-selection
        const ipv4Network = values.machineNetworks.find(
          (network) => network.cidr && Address4.isValid(network.cidr),
        );
        if (ipv4Network) {
          setFieldValue('machineNetworks', [ipv4Network]);
        } else {
          // No IPv4 network found, set empty for auto-selection
          setFieldValue('machineNetworks', []);
        }
      }
    }
    // Ensure single-stack inputs are IPv4 after switching from dual-stack
    if (values.clusterNetworks && values.clusterNetworks.length >= 1) {
      const defaultCluster =
        defaultNetworkValues.clusterNetworksIpv4 && defaultNetworkValues.clusterNetworksIpv4[0];
      const firstCluster = values.clusterNetworks[0];
      const ipv4Cluster = defaultCluster
        ? {
            cidr: defaultCluster.cidr,
            hostPrefix: defaultCluster.hostPrefix,
            clusterId: firstCluster.clusterId, // ← Preserve clusterId from original network
          }
        : {
            cidr: '',
            hostPrefix: '',
            clusterId: clusterId, // ← Use current clusterId
          };
      setFieldValue('clusterNetworks', [ipv4Cluster]);
    }
    if (values.serviceNetworks && values.serviceNetworks.length >= 1) {
      const defaultService =
        defaultNetworkValues.serviceNetworksIpv4 && defaultNetworkValues.serviceNetworksIpv4[0];
      const firstService = values.serviceNetworks[0];
      const ipv4Service = defaultService
        ? {
            cidr: defaultService.cidr,
            clusterId: firstService.clusterId, // ← Preserve clusterId from original network
          }
        : {
            cidr: '',
            clusterId: clusterId, // ← Use current clusterId
          };
      setFieldValue('serviceNetworks', [ipv4Service]);
    }

    void validateForm();
  }, [
    setFieldValue,
    validateForm,
    clusterId,
    defaultNetworkValues.clusterNetworksIpv4,
    defaultNetworkValues.serviceNetworksIpv4,
    values.clusterNetworks,
    values.machineNetworks,
    values.serviceNetworks,
  ]);

  const setDualStack = () => {
    setFieldValue('stackType', DUAL_STACK);
    setFieldValue('vipDhcpAllocation', false);

    if (values.networkType === NETWORK_TYPE_SDN) {
      setFieldValue('networkType', NETWORK_TYPE_OVN);
    }

    if (values.machineNetworks && values.machineNetworks?.length < 2) {
      // Ensure IPv4 is primary when switching to dual-stack
      const firstNetwork = values.machineNetworks[0];
      const isFirstIPv6 = firstNetwork?.cidr && Address6.isValid(firstNetwork.cidr);

      if (isFirstIPv6) {
        // If first network is IPv6, make IPv4 primary and IPv6 secondary
        const IPv4Subnets = hostSubnets.filter((subnet) => Address4.isValid(subnet.subnet));
        const cidrIPv4 = IPv4Subnets.length >= 1 ? IPv4Subnets[0].subnet : NO_SUBNET_SET;
        setFieldValue(
          'machineNetworks',
          [
            { cidr: cidrIPv4, clusterId: clusterId },
            { cidr: firstNetwork.cidr, clusterId: clusterId },
          ],
          false,
        );
      } else {
        // If first network is IPv4, add IPv6 as secondary
        setFieldValue(
          'machineNetworks',
          [...values.machineNetworks, { cidr: cidrIPv6, clusterId: clusterId }],
          false,
        );
      }
    }
    if (values.clusterNetworks && values.clusterNetworks?.length < 2) {
      setFieldValue(
        'clusterNetworks',
        [
          ...values.clusterNetworks,
          defaultNetworkValues.clusterNetworksDualstack?.length
            ? defaultNetworkValues.clusterNetworksDualstack[1]
            : { cidr: '', hostPrefix: '', clusterId: clusterId },
        ],
        false,
      );
    }
    if (values.serviceNetworks && values.serviceNetworks?.length < 2) {
      setFieldValue(
        'serviceNetworks',
        [
          ...values.serviceNetworks,
          defaultNetworkValues.serviceNetworksDualstack?.length
            ? defaultNetworkValues.serviceNetworksDualstack[1]
            : { cidr: '', clusterId: clusterId },
        ],
        false,
      );
    }
  };

  const setStackType = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === DUAL_STACK) {
      setDualStack();
    } else if (
      hasDualStackConfigurationChanged(
        defaultNetworkValues.clusterNetworksDualstack || [],
        defaultNetworkValues.serviceNetworksDualstack || [],
        cidrIPv6,
        values,
      )
    ) {
      setConfirmModal(true);
    } else {
      setSingleStack();
    }
  };

  React.useEffect(() => {
    if (shouldSetSingleStack) {
      setSingleStack();
    }
  }, [shouldSetSingleStack, setSingleStack]);

  return (
    <>
      <FormGroup
        label="Networking stack type"
        fieldId={getFieldId('stackType', 'radio')}
        onChange={setStackType}
        isInline
      >
        <Split>
          <SplitItem>
            <OcmRadioField
              name={'stackType'}
              value={IPV4_STACK}
              isDisabled={!isDualStackSelectable}
              label="IPv4&nbsp;"
            />
          </SplitItem>
          <SplitItem>
            <PopoverIcon
              bodyContent="Select this when your hosts are using only IPv4."
              buttonStyle={{ top: '-4px' }}
            />
          </SplitItem>
        </Split>
        <Split>
          <SplitItem>
            <Tooltip
              content={
                'Dual-stack is only available when your hosts are using IPV4 together with IPV6.'
              }
              hidden={isDualStackSelectable}
            >
              <OcmRadioField
                name={'stackType'}
                value={DUAL_STACK}
                isDisabled={!isDualStackSelectable}
                label="Dual-stack&nbsp;"
              />
            </Tooltip>
          </SplitItem>
          <SplitItem>
            <PopoverIcon
              bodyContent="Select dual-stack when your hosts are using IPV4 together with IPV6."
              buttonStyle={{ top: '-4px' }}
            />
          </SplitItem>
        </Split>
      </FormGroup>

      {openConfirmModal && (
        <ConfirmationModal
          title={'Change stack type?'}
          titleIconVariant={'warning'}
          confirmationButtonText={'Change'}
          confirmationButtonVariant={ButtonVariant.primary}
          content={<p>All data and configuration done for 'Dual-stack' will be lost.</p>}
          onClose={() => {
            setConfirmModal(false);
            setDualStack();
          }}
          onConfirm={() => {
            setConfirmModal(false);
            setSingleStack();
          }}
        />
      )}
    </>
  );
};
