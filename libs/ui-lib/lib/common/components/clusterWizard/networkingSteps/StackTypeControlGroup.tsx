import React from 'react';
import { ButtonVariant, FormGroup, Radio, Split, SplitItem, Tooltip } from '@patternfly/react-core';
import { useFormikContext } from 'formik';
import { Address4, Address6 } from 'ip-address';

import {
  HostSubnets,
  NetworkConfigurationValues,
  NETWORK_TYPE_OVN,
  NETWORK_TYPE_SDN,
} from '../../../types';
import { ConfirmationModal, getFieldId, PopoverIcon } from '../../ui';
import { DUAL_STACK, NO_SUBNET_SET, SINGLE_STACK } from '../../../config';
import { RadioField } from '../../ui/formik';
import { useTranslation } from '../../../hooks/use-translation-wrapper';
import { reorderNetworksByCurrentPrimary } from './reorderNetworks';
import {
  Cluster,
  ClusterDefaultConfig,
  ClusterNetwork,
  MachineNetwork,
  ServiceNetwork,
} from '@openshift-assisted/types/assisted-installer-service';

export type StackTypeDefaultNetworkValues = Pick<
  ClusterDefaultConfig,
  | 'clusterNetworksDualstack'
  | 'clusterNetworksIpv4'
  | 'serviceNetworksDualstack'
  | 'serviceNetworksIpv4'
>;

export type StackTypeControlGroupProps = {
  clusterId: Cluster['id'];
  isDualStackSelectable: boolean;
  hostSubnets: HostSubnets;
  defaultNetworkValues: StackTypeDefaultNetworkValues;
  isViewerMode?: boolean;
  allowSingleStackIPv6?: boolean;
};

const hasDualStackConfigurationChanged = (
  clusterNetworks: ClusterNetwork[],
  serviceNetworks: ServiceNetwork[],
  cidrIPv6: MachineNetwork['cidr'],
  values: NetworkConfigurationValues,
) =>
  clusterNetworks &&
  serviceNetworks &&
  ((values.machineNetworks?.[1] && values.machineNetworks[1].cidr !== cidrIPv6) ||
    (values.clusterNetworks?.[1] && values.clusterNetworks[1].cidr !== clusterNetworks[1]?.cidr) ||
    (values.clusterNetworks?.[1] &&
      values.clusterNetworks[1].hostPrefix !== clusterNetworks[1]?.hostPrefix) ||
    (values.serviceNetworks?.[1] && values.serviceNetworks[1].cidr !== serviceNetworks[1]?.cidr) ||
    values.apiVips?.[1]?.ip ||
    values.ingressVips?.[1]?.ip);

export const StackTypeControlGroup = ({
  clusterId,
  isDualStackSelectable,
  hostSubnets,
  defaultNetworkValues,
  isViewerMode = false,
  allowSingleStackIPv6 = false,
}: StackTypeControlGroupProps) => {
  const { t } = useTranslation();
  const { setFieldValue, values, validateForm } = useFormikContext<NetworkConfigurationValues>();
  const [openConfirmModal, setConfirmModal] = React.useState(false);

  const singleStackLabel = allowSingleStackIPv6 ? t('ai:Single stack') : t('ai:IPv4');

  const IPv6Subnets = hostSubnets.filter((subnet) => Address6.isValid(subnet.subnet));
  const cidrIPv6 = IPv6Subnets.length >= 1 ? IPv6Subnets[0].subnet : NO_SUBNET_SET;
  const isSingleStackSelected = values.stackType !== DUAL_STACK;

  const shouldSetSingleStack =
    !isViewerMode && !isDualStackSelectable && values.stackType === DUAL_STACK;

  const setSingleStack = React.useCallback(() => {
    setFieldValue('stackType', SINGLE_STACK);

    const firstNetwork = values.machineNetworks?.[0];
    const isFirstIPv4 = Boolean(firstNetwork?.cidr && Address4.isValid(firstNetwork.cidr));

    if (values.machineNetworks && values.machineNetworks?.length >= 2) {
      if (isFirstIPv4) {
        setFieldValue('machineNetworks', [firstNetwork]);
      } else {
        const ipv4Network = values.machineNetworks.find(
          (network) => network.cidr && Address4.isValid(network.cidr),
        );
        if (ipv4Network) {
          setFieldValue('machineNetworks', [ipv4Network]);
        } else {
          setFieldValue('machineNetworks', []);
        }
      }
    }

    if (values.clusterNetworks && values.clusterNetworks.length >= 1) {
      const defaultCluster =
        defaultNetworkValues.clusterNetworksIpv4 && defaultNetworkValues.clusterNetworksIpv4[0];
      const firstCluster = values.clusterNetworks[0];
      const ipv4Cluster = defaultCluster
        ? {
            cidr: defaultCluster.cidr,
            hostPrefix: defaultCluster.hostPrefix,
            clusterId: firstCluster.clusterId,
          }
        : {
            cidr: '',
            hostPrefix: '',
            clusterId: clusterId,
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
            clusterId: firstService.clusterId,
          }
        : {
            cidr: '',
            clusterId: clusterId,
          };
      setFieldValue('serviceNetworks', [ipv4Service]);
    }

    if (!values.vipDhcpAllocation) {
      const pruneVips = (
        vips?: { ip?: string; clusterId?: Cluster['id'] }[],
      ): { ip: string; clusterId: Cluster['id'] }[] => {
        if (!vips || vips.length === 0) return [];
        const keepIndex = isFirstIPv4 ? 0 : 1;
        const chosen = vips[keepIndex];
        return chosen && chosen.ip
          ? [{ ip: chosen.ip, clusterId: chosen.clusterId || clusterId }]
          : [];
      };

      setFieldValue('apiVips', pruneVips(values.apiVips));
      setFieldValue('ingressVips', pruneVips(values.ingressVips));
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
    values.apiVips,
    values.ingressVips,
    values.vipDhcpAllocation,
  ]);

  const setDualStack = () => {
    setFieldValue('stackType', DUAL_STACK);
    setFieldValue('vipDhcpAllocation', false);

    if (values.networkType === NETWORK_TYPE_SDN) {
      setFieldValue('networkType', NETWORK_TYPE_OVN);
    }

    if (values.machineNetworks && values.machineNetworks?.length < 2) {
      const firstNetwork = values.machineNetworks[0];
      const isFirstIPv6 = firstNetwork?.cidr && Address6.isValid(firstNetwork.cidr);

      if (isFirstIPv6) {
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
    if (values.apiVips && values.apiVips.length < 2) {
      setFieldValue(
        'apiVips',
        [values.apiVips[0] || { ip: '', clusterId: clusterId }, { ip: '', clusterId: clusterId }],
        false,
      );
    }
    if (values.ingressVips && values.ingressVips.length < 2) {
      setFieldValue(
        'ingressVips',
        [
          values.ingressVips[0] || { ip: '', clusterId: clusterId },
          { ip: '', clusterId: clusterId },
        ],
        false,
      );
    }
  };

  const primaryCidr = values.machineNetworks?.[0]?.cidr;

  React.useEffect(() => {
    if (isViewerMode) {
      return;
    }
    reorderNetworksByCurrentPrimary(values, setFieldValue);
  }, [
    isViewerMode,
    setFieldValue,
    values,
    values.stackType,
    primaryCidr,
    values.clusterNetworks,
    values.serviceNetworks,
  ]);

  const handleSingleStackRadioClick = () => {
    if (isSingleStackSelected) {
      return;
    }
    if (
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

  const singleStackPopoverContent = allowSingleStackIPv6
    ? t('ai:Select a single address family (IPv4 or IPv6) for your machine network.')
    : t('ai:Select this when your hosts are using only IPv4.');

  const singleStackRadioId = getFieldId('stackType', 'radio', SINGLE_STACK);

  return (
    <>
      <FormGroup
        label={t('ai:Networking stack type')}
        fieldId={getFieldId('stackType', 'radio')}
        isInline
      >
        <Split>
          <SplitItem>
            <Radio
              id={singleStackRadioId}
              name="stackType"
              value={SINGLE_STACK}
              label={`${singleStackLabel}\u00A0`}
              isChecked={isSingleStackSelected}
              isDisabled={!isDualStackSelectable || isViewerMode}
              onChange={() => handleSingleStackRadioClick()}
              data-testid="form-radio-stackType-singleStack-field"
            />
          </SplitItem>
          <SplitItem>
            <PopoverIcon bodyContent={singleStackPopoverContent} buttonStyle={{ top: '-4px' }} />
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
              <RadioField
                name={'stackType'}
                value={DUAL_STACK}
                isDisabled={!isDualStackSelectable || isViewerMode}
                label="Dual-stack&nbsp;"
                callFormikOnChange={false}
                onChange={() => setDualStack()}
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
          content={<p>All data and configuration done for &apos;Dual-stack&apos; will be lost.</p>}
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
