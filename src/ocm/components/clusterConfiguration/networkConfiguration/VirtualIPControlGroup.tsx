import React from 'react';
import { useSelector } from 'react-redux';
import { useFormikContext } from 'formik';
import { Spinner, Alert, AlertVariant, Tooltip } from '@patternfly/react-core';
import {
  Cluster,
  NetworkConfigurationValues,
  FormikStaticField,
  FeatureSupportLevelBadge,
  NETWORK_TYPE_SDN,
  selectMachineNetworkCIDR,
  getVipValidationsById,
} from '../../../../common';
import { selectCurrentClusterPermissionsState } from '../../../selectors';
import { OcmCheckboxField, OcmInputField } from '../../ui/OcmFormFields';
import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';

interface VipStaticValueProps {
  vipName: 'apiVip' | 'ingressVip';
  cluster: Cluster;
  validationErrorMessage?: string;
}

const VipStaticValue = ({ vipName, cluster, validationErrorMessage }: VipStaticValueProps) => {
  const { vipDhcpAllocation } = cluster;
  const machineNetworkCidr = selectMachineNetworkCIDR(cluster);

  if (vipDhcpAllocation && cluster[vipName]) {
    return <>{cluster[vipName]}</>;
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

export type VirtualIPControlGroupProps = {
  cluster: Cluster;
  isVipDhcpAllocationDisabled?: boolean;
};

export const VirtualIPControlGroup = ({
  cluster,
  isVipDhcpAllocationDisabled,
}: VirtualIPControlGroupProps) => {
  const { values, setFieldValue } = useFormikContext<NetworkConfigurationValues>();
  const { isViewerMode } = useSelector(selectCurrentClusterPermissionsState);
  const { t } = useTranslation();

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
  } = React.useMemo(
    () => getVipValidationsById(t, cluster.validationsInfo),
    [t, cluster.validationsInfo],
  );

  const enableAllocation = values.networkType === NETWORK_TYPE_SDN;

  React.useEffect(() => {
    if (!isViewerMode && !enableAllocation) {
      setFieldValue('vipDhcpAllocation', false);
    }
  }, [enableAllocation, isViewerMode, setFieldValue]);

  const onChangeDhcp = React.useCallback(
    (hasDhcp: boolean) => {
      // We need to sync the values back to the form
      setFieldValue('apiVip', hasDhcp ? '' : cluster.apiVip);
      setFieldValue('ingressVip', hasDhcp ? '' : cluster.ingressVip);
    },
    [cluster.apiVip, cluster.ingressVip, setFieldValue],
  );

  return (
    <>
      {!isVipDhcpAllocationDisabled && (
        <OcmCheckboxField
          onChange={onChangeDhcp}
          label={
            <>
              <Tooltip
                hidden={enableAllocation}
                content={
                  "A cluster with OVN networking type cannot use 'allocate IPs via DHCP server'"
                }
              >
                <span>Allocate IPs via DHCP server</span>
              </Tooltip>
              <FeatureSupportLevelBadge
                featureId="VIP_AUTO_ALLOC"
                openshiftVersion={cluster.openshiftVersion}
              />
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
            value={values.apiVip || ''}
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
            value={values.ingressVip || ''}
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
          <OcmInputField label="API IP" name="apiVip" helperText={apiVipHelperText} isRequired />
          <OcmInputField
            name="ingressVip"
            label="Ingress IP"
            helperText={ingressVipHelperText}
            isRequired
          />
        </>
      )}
    </>
  );
};
