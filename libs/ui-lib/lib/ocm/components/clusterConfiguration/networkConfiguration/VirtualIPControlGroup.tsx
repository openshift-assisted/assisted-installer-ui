import React from 'react';
import { useSelector } from 'react-redux';
import { FieldArray, useFormikContext } from 'formik';
import {
  Spinner,
  Alert,
  AlertVariant,
  Tooltip,
  FormGroup,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import {
  NetworkConfigurationValues,
  FormikStaticField,
  NETWORK_TYPE_SDN,
  selectMachineNetworkCIDR,
  getVipValidationsById,
  DUAL_STACK,
  PopoverIcon,
  selectApiVip,
  selectIngressVip,
} from '../../../../common';
import { selectCurrentClusterPermissionsState } from '../../../store/slices/current-cluster/selectors';
import { OcmCheckboxField, OcmInputField } from '../../ui/OcmFormFields';
import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';
import NewFeatureSupportLevelBadge from '../../../../common/components/newFeatureSupportLevels/NewFeatureSupportLevelBadge';
import { Cluster, Ip, SupportLevel } from '@openshift-assisted/types/assisted-installer-service';

interface VipStaticValueProps {
  id?: string;
  vipValue: Ip;
  cluster: Cluster;
  validationErrorMessage?: string;
}

const VipStaticValue = ({
  vipValue,
  cluster,
  validationErrorMessage,
  id = 'vip-static',
}: VipStaticValueProps) => {
  const { vipDhcpAllocation } = cluster;
  const machineNetworkCidr = selectMachineNetworkCIDR(cluster);

  if (vipDhcpAllocation && !!vipValue) {
    return <span id={`${id}-allocated`}>{vipValue}</span>;
  }
  if (vipDhcpAllocation && validationErrorMessage) {
    return (
      <Alert
        id={`${id}-alert-allocation-failed`}
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
        <Spinner size="md" id={`${id}-allocating`} />
        <i> This IP is being allocated by the DHCP server</i>
      </>
    );
  }
  return <i>This IP will be allocated by the DHCP server</i>;
};

export type VirtualIPControlGroupProps = {
  cluster: Cluster;
  isVipDhcpAllocationDisabled?: boolean;
  supportLevel?: SupportLevel;
};

export const VirtualIPControlGroup = ({
  cluster,
  isVipDhcpAllocationDisabled,
  supportLevel,
}: VirtualIPControlGroupProps) => {
  const { values, setFieldValue } = useFormikContext<NetworkConfigurationValues>();
  const { isViewerMode } = useSelector(selectCurrentClusterPermissionsState);
  const { t } = useTranslation();

  const ipHelperText = 'Make sure the IP is not used by any other device on your network.';
  const ipPopoverContent =
    'Provides an endpoint for users, both human and machine, to interact with and configure the platform.';

  const {
    'api-vips-defined': apiVipFailedValidationMessage,
    'ingress-vips-defined': ingressVipFailedValidationMessage,
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
      setFieldValue('apiVips', hasDhcp ? [] : cluster.apiVips, true);
      setFieldValue('ingressVips', hasDhcp ? [] : cluster.ingressVips, true);
    },
    [cluster.apiVips, cluster.ingressVips, setFieldValue],
  );

  const setVipValue = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue(field, [{ ip: e.target.value, clusterId: cluster.id }], true);
  };

  const ipFieldsSuffix = values.stackType === DUAL_STACK ? ' (IPv4)' : '';
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
              <NewFeatureSupportLevelBadge featureId="VIP_AUTO_ALLOC" supportLevel={supportLevel} />
            </>
          }
          name="vipDhcpAllocation"
          isDisabled={!enableAllocation}
        />
      )}
      {values.vipDhcpAllocation ? (
        <>
          <FormikStaticField
            label={
              <>
                <span>API IP{ipFieldsSuffix}</span> <PopoverIcon bodyContent={ipPopoverContent} />
              </>
            }
            name="apiVip"
            helperText={ipHelperText}
            value={selectApiVip(values)}
            isValid={!apiVipFailedValidationMessage}
            isRequired
          >
            <VipStaticValue
              id="vip-api"
              vipValue={selectApiVip(cluster)}
              cluster={cluster}
              validationErrorMessage={apiVipFailedValidationMessage}
            />
          </FormikStaticField>
          <FormikStaticField
            label={
              <>
                <span>Ingress IP{ipFieldsSuffix}</span>{' '}
                <PopoverIcon bodyContent={ipPopoverContent} />
              </>
            }
            name="ingressVip"
            helperText={ipHelperText}
            value={selectIngressVip(values)}
            isValid={!ingressVipFailedValidationMessage}
            isRequired
          >
            <VipStaticValue
              id="vip-ingress"
              vipValue={selectIngressVip(cluster)}
              cluster={cluster}
              validationErrorMessage={ingressVipFailedValidationMessage}
            />
          </FormikStaticField>
        </>
      ) : (
        <FormGroup>
          <FieldArray name="vips">
            {() => (
              <Stack>
                <StackItem>
                  <OcmInputField
                    label={
                      <>
                        <span>API IP{ipFieldsSuffix}</span>{' '}
                        <PopoverIcon bodyContent={ipPopoverContent} />
                      </>
                    }
                    name="apiVips.0.ip"
                    helperText={ipHelperText}
                    isRequired
                    onChange={(e) =>
                      setVipValue('apiVips', e as React.ChangeEvent<HTMLInputElement>)
                    }
                  />
                </StackItem>
                <StackItem>
                  <OcmInputField
                    name="ingressVips.0.ip"
                    label={
                      <>
                        <span>Ingress IP{ipFieldsSuffix}</span>{' '}
                        <PopoverIcon bodyContent={ipPopoverContent} />
                      </>
                    }
                    helperText={ipHelperText}
                    isRequired
                    onChange={(e) =>
                      setVipValue('ingressVips', e as React.ChangeEvent<HTMLInputElement>)
                    }
                  />
                </StackItem>
              </Stack>
            )}
          </FieldArray>
        </FormGroup>
      )}
    </>
  );
};
