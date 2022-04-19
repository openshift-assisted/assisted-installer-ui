import React, { useEffect, useMemo } from 'react';
import { useFormikContext } from 'formik';
import { Spinner, Alert, AlertVariant, Tooltip } from '@patternfly/react-core';
import { Cluster, stringToJSON } from '../../../api';
import { HostSubnets, NetworkConfigurationValues, ValidationsInfo } from '../../../types/clusters';
import { CheckboxField, FormikStaticField, InputField } from '../../ui';
import { NO_SUBNET_SET } from '../../../config';
import { FeatureSupportLevelBadge } from '../../featureSupportLevels';
interface VipStaticValueProps {
  vipName: string;
  cluster: Cluster;
  validationErrorMessage?: string;
}

const VipStaticValue = ({ vipName, cluster, validationErrorMessage }: VipStaticValueProps) => {
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
  const validationsInfo = stringToJSON<ValidationsInfo>(validationsInfoString) || {};
  const failedDhcpAllocationMessageStubs = [
    'VIP IP allocation from DHCP server has been timed out', // TODO(jtomasek): remove this one once it is no longer in backend
    'IP allocation from the DHCP server timed out.',
  ];
  return (validationsInfo.network || []).reduce((lookup, validation) => {
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

export type VirtualIPControlGroupProps = {
  cluster: Cluster;
  hostSubnets: HostSubnets;
  isVipDhcpAllocationDisabled?: boolean;
};

export const VirtualIPControlGroup = ({
  cluster,
  hostSubnets,
  isVipDhcpAllocationDisabled,
}: VirtualIPControlGroupProps) => {
  const { values, setFieldValue } = useFormikContext<NetworkConfigurationValues>();

  const apiVipHelperText = `Provide an endpoint for users, both human and machine, to interact with and configure the platform. If needed, contact your IT manager for more information. ${getVipHelperSuffix(
    cluster.apiVip,
    cluster.vipDhcpAllocation,
    values.vipDhcpAllocation,
  )}`;
  const ingressVipHelperText = `Provide an endpoint for application traffic flowing in from outside the cluster. If needed, contact your IT manager for more information. ${getVipHelperSuffix(
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

  const enableAllocation = useMemo(() => values.networkType === 'OpenShiftSDN', [values]);

  useEffect(() => {
    if (!enableAllocation) {
      setFieldValue('vipDhcpAllocation', false);
    }
  }, [enableAllocation, setFieldValue]);

  return (
    <>
      {!isVipDhcpAllocationDisabled && (
        <CheckboxField
          label={
            <>
              <Tooltip
                hidden={enableAllocation}
                content={
                  "A cluster with OVN networking type cannot use 'allocate virtual IPs via DHCP server'"
                }
              >
                <span>Allocate IPs via DHCP server</span>
              </Tooltip>
              <FeatureSupportLevelBadge
                featureId="VIP_AUTO_ALLOC"
                openshiftVersion={cluster.openshiftVersion}
              ></FeatureSupportLevelBadge>
            </>
          }
          name="vipDhcpAllocation"
          isDisabled={!enableAllocation}
        />
      )}
      {values.vipDhcpAllocation ? (
        <>
          <FormikStaticField
            label="API IP"
            name="apiVip"
            helperText={apiVipHelperText}
            value={cluster.apiVip || ''}
            isValid={!apiVipFailedValidationMessage}
            isRequired
          >
            <VipStaticValue
              vipName="apiVip"
              cluster={cluster}
              validationErrorMessage={apiVipFailedValidationMessage}
            />
          </FormikStaticField>
          <FormikStaticField
            label="Ingress IP"
            name="ingressVip"
            helperText={ingressVipHelperText}
            value={cluster.ingressVip || ''}
            isValid={!ingressVipFailedValidationMessage}
            isRequired
          >
            <VipStaticValue
              vipName="ingressVip"
              cluster={cluster}
              validationErrorMessage={ingressVipFailedValidationMessage}
            />
          </FormikStaticField>
        </>
      ) : (
        <>
          <InputField
            label="API IP"
            name="apiVip"
            helperText={apiVipHelperText}
            isRequired
            isDisabled={
              !hostSubnets.length ||
              !values.machineNetworks?.length ||
              values.machineNetworks[0].cidr === NO_SUBNET_SET
            }
          />
          <InputField
            name="ingressVip"
            label="Ingress IP"
            helperText={ingressVipHelperText}
            isRequired
            isDisabled={
              !hostSubnets.length ||
              !values.machineNetworks?.length ||
              values.machineNetworks[0].cidr === NO_SUBNET_SET
            }
          />
        </>
      )}
    </>
  );
};
