import React from 'react';
import { useSelector } from 'react-redux';
import { ButtonVariant, FormGroup, Tooltip } from '@patternfly/react-core';
import { useFormikContext } from 'formik';
import { Address6 } from 'ip-address';

import {
  HostSubnets,
  NetworkConfigurationValues,
  getFieldId,
  DUAL_STACK,
  IPV4_STACK,
  NETWORK_TYPE_OVN,
  NETWORK_TYPE_SDN,
  NO_SUBNET_SET,
  Cluster,
  ClusterNetwork,
  MachineNetwork,
  ServiceNetwork,
} from '../../../../common';
import { ConfirmationModal, PopoverIcon } from '../../../../common/components/ui';
import { useDefaultConfiguration } from '../ClusterDefaultConfigurationContext';
import { selectCurrentClusterPermissionsState } from '../../../selectors';
import { OcmRadioField } from '../../ui/OcmFormFields';

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
      setFieldValue('machineNetworks', values.machineNetworks.slice(0, 1));
    }
    if (values.clusterNetworks && values.clusterNetworks?.length >= 2) {
      setFieldValue('clusterNetworks', values.clusterNetworks.slice(0, 1));
    }
    if (values.serviceNetworks && values.serviceNetworks?.length >= 2) {
      setFieldValue('serviceNetworks', values.serviceNetworks.slice(0, 1));
    }

    void validateForm();
  }, [
    setFieldValue,
    validateForm,
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
      setFieldValue(
        'machineNetworks',
        [...values.machineNetworks, { cidr: cidrIPv6, clusterId: clusterId }],
        false,
      );
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
    <Tooltip
      content={'Dual-stack is only available when your hosts are using IPV4 together with IPV6.'}
      hidden={isDualStackSelectable}
      position={'top-start'}
    >
      <>
        <FormGroup
          label="Networking stack type"
          fieldId={getFieldId('stackType', 'radio')}
          isInline
          onChange={setStackType}
        >
          <OcmRadioField
            name={'stackType'}
            value={IPV4_STACK}
            isDisabled={!isDualStackSelectable}
            label={
              <>
                {'IPv4'}{' '}
                <PopoverIcon
                  noVerticalAlign
                  bodyContent="Select this when your hosts are using only IPv4."
                />
              </>
            }
          />
          <OcmRadioField
            name={'stackType'}
            value={DUAL_STACK}
            isDisabled={!isDualStackSelectable}
            label={
              <>
                {'Dual-stack'}{' '}
                <PopoverIcon
                  noVerticalAlign
                  bodyContent="Select dual-stack when your hosts are using IPV4 together with IPV6."
                />
              </>
            }
          />
        </FormGroup>
        {openConfirmModal && (
          <ConfirmationModal
            title={'Change stack type?'}
            titleIconVariant={'warning'}
            confirmationButtonText={'Change'}
            confirmationButtonVariant={ButtonVariant.primary}
            content={
              <>
                <p>All data and configuration done for 'Dual-stack' will be lost.</p>
              </>
            }
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
    </Tooltip>
  );
};
