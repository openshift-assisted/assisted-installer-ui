import React from 'react';
import { useFormikContext } from 'formik';
import { Spinner, Alert, AlertVariant } from '@patternfly/react-core';
import { HostSubnets, ClusterConfigurationValues, ValidationsInfo } from '../../types/clusters';
import { InputField, SelectField, SwitchField } from '../ui/formik';
import { Cluster } from '../../api/types';
import { StaticField } from '../ui/StaticTextField';
import { NO_SUBNET_SET } from './utils';
import { stringToJSON } from '../../api/utils';

type VipStaticValueProps = {
  vipName: string;
  cluster: Cluster;
  validationErrorMessage?: string;
};

const VipStaticValue: React.FC<VipStaticValueProps> = ({
  vipName,
  cluster,
  validationErrorMessage,
}) => {
  const { vipDhcpAllocation, machineNetworkCidr } = cluster;

  if (vipDhcpAllocation && cluster[vipName]) {
    return cluster[vipName];
  }
  if (vipDhcpAllocation && validationErrorMessage) {
    return (
      <Alert
        variant={AlertVariant.danger}
        title="The DHCP server failed to allocate the IP"
        isInline
      >
        {validationErrorMessage}
      </Alert>
    );
  }
  if (vipDhcpAllocation && machineNetworkCidr) {
    return (
      <>
        <Spinner size="md" />
        <i> This IP is being allocated by the DHCP server</i>
      </>
    );
  }
  return <i>This IP will be allocated by the DHCP server</i>;
};

const getVipHelperSuffix = (
  vip?: string,
  vipDhcpAllocation?: boolean,
  vipDhcpAllocationFormValue?: boolean,
): string => {
  if (!vipDhcpAllocationFormValue) {
    return 'Make sure that the VIP is unique and not used by any other device on your network.';
  }
  if (vipDhcpAllocation && vip) {
    return 'This IP was allocated by the DHCP server.';
  }
  return '';
};

const getVipValidationsById = (
  validationsInfoString?: Cluster['validationsInfo'],
): { [key: string]: string | undefined } => {
  const validationsInfo = stringToJSON<ValidationsInfo>(validationsInfoString) || {
    hostsData: [],
    network: [],
    configuration: [],
  };
  const failedDhcpAllocationMessageStubs = [
    'VIP IP allocation from DHCP server has been timed out', // TODO(jtomasek): remove this one once it is no longer in backend
    'IP allocation from the DHCP server timed out.',
  ];
  return validationsInfo.network.reduce((lookup, validation) => {
    if (['api-vip-defined', 'ingress-vip-defined'].includes(validation.id)) {
      lookup[validation.id] =
        validation.status === 'failure' &&
        failedDhcpAllocationMessageStubs.find((stub) => validation.message.match(stub))
          ? validation.message
          : undefined;
    }
    return lookup;
  }, {});
};

type BasicNetworkFieldsProps = {
  cluster: Cluster;
  hostSubnets: HostSubnets;
};

const BasicNetworkFields: React.FC<BasicNetworkFieldsProps> = ({ cluster, hostSubnets }) => {
  const { validateField, values } = useFormikContext<ClusterConfigurationValues>();

  const apiVipHelperText = `Virtual IP used to reach the OpenShift cluster API. ${getVipHelperSuffix(
    cluster.apiVip,
    cluster.vipDhcpAllocation,
    values.vipDhcpAllocation,
  )}`;
  const ingressVipHelperText = `Virtual IP used for cluster ingress traffic. ${getVipHelperSuffix(
    cluster.ingressVip,
    cluster.vipDhcpAllocation,
    values.vipDhcpAllocation,
  )}`;

  const {
    'api-vip-defined': apiVipFailedValidationMessage,
    'ingress-vip-defined': ingressVipFailedValidationMessage,
  } = React.useMemo(() => getVipValidationsById(cluster.validationsInfo), [
    cluster.validationsInfo,
  ]);

  return (
    <>
      <SelectField
        name="hostSubnet"
        label="Available subnets"
        options={
          hostSubnets.length
            ? [
                {
                  label: `Please select a subnet. (${hostSubnets.length} available)`,
                  value: NO_SUBNET_SET,
                  isDisabled: true,
                  id: 'form-input-hostSubnet-field-option-no-subnet',
                },
                ...hostSubnets
                  .sort((subA, subB) => subA.humanized.localeCompare(subB.humanized))
                  .map((hn, index) => ({
                    label: hn.humanized,
                    value: hn.humanized,
                    id: `form-input-hostSubnet-field-option-${index}`,
                  })),
              ]
            : [{ label: 'No subnets are currently available', value: NO_SUBNET_SET }]
        }
        getHelperText={(value) => {
          const matchingSubnet = hostSubnets.find((hn) => hn.humanized === value);
          return matchingSubnet
            ? `Subnet is available on hosts: ${matchingSubnet.hostIDs.join(', ')}`
            : undefined;
        }}
        onChange={() => {
          if (!values.vipDhcpAllocation) {
            validateField('ingressVip');
            validateField('apiVip');
          }
        }}
        isDisabled={!hostSubnets.length}
        isRequired
      />
      <SwitchField label="Allocate virtual IPs via DHCP server" name="vipDhcpAllocation" />
      {values.vipDhcpAllocation ? (
        <>
          <StaticField
            label="API Virtual IP"
            name="apiVip"
            helperText={apiVipHelperText}
            value={
              <VipStaticValue
                vipName="apiVip"
                cluster={cluster}
                validationErrorMessage={apiVipFailedValidationMessage}
              />
            }
            isValid={!apiVipFailedValidationMessage}
            isRequired
          />
          <StaticField
            label="Ingress Virtual IP"
            name="ingressVip"
            helperText={ingressVipHelperText}
            value={
              <VipStaticValue
                vipName="ingressVip"
                cluster={cluster}
                validationErrorMessage={ingressVipFailedValidationMessage}
              />
            }
            isValid={!ingressVipFailedValidationMessage}
            isRequired
          />
        </>
      ) : (
        <>
          <InputField
            label="API Virtual IP"
            name="apiVip"
            helperText={apiVipHelperText}
            isRequired
            isDisabled={!hostSubnets.length || values.hostSubnet === NO_SUBNET_SET}
          />
          <InputField
            name="ingressVip"
            label="Ingress Virtual IP"
            helperText={ingressVipHelperText}
            isRequired
            isDisabled={!hostSubnets.length || values.hostSubnet === NO_SUBNET_SET}
          />
        </>
      )}
    </>
  );
};
export default BasicNetworkFields;
