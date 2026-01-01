import React from 'react';
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
  DUAL_STACK,
  selectMachineNetworkCIDR,
  getVipValidationsById,
  PopoverIcon,
  selectApiVip,
  selectIngressVip,
  HostSubnets,
  NO_SUBNET_SET,
  CheckboxField,
  InputField,
} from '../../../../common';
import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';
import NewFeatureSupportLevelBadge from '../../../../common/components/newFeatureSupportLevels/NewFeatureSupportLevelBadge';
import {
  ApiVip,
  Cluster,
  Ip,
  SupportLevel,
} from '@openshift-assisted/types/assisted-installer-service';
import { TFunction } from 'i18next';

const getVipHelperSuffix = (
  t: TFunction,
  vip?: string,
  vipDhcpAllocation?: boolean,
  vipDhcpAllocationFormValue?: boolean,
): string => {
  if (!vipDhcpAllocationFormValue) {
    return t(
      'ai:Make sure that the VIP is unique and not used by any other device on your network.',
    );
  }
  if (vipDhcpAllocation && vip) {
    return t('ai:This IP was allocated by the DHCP server.');
  }
  return '';
};

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
  const { t } = useTranslation();

  if (vipDhcpAllocation && !!vipValue) {
    return <span id={`${id}-allocated`}>{vipValue}</span>;
  }
  if (vipDhcpAllocation && validationErrorMessage) {
    return (
      <Alert
        id={`${id}-alert-allocation-failed`}
        variant={AlertVariant.danger}
        title={t('ai:The DHCP server failed to allocate the IP')}
        isInline
      >
        {validationErrorMessage}
      </Alert>
    );
  }
  if (vipDhcpAllocation && machineNetworkCidr) {
    return (
      <>
        <Spinner size="md" id={`${id}-allocating`} data-testid={`vip-static-${id}-value-spinner`} />
        <i>{t('ai:This IP is being allocated by the DHCP server')}</i>
      </>
    );
  }
  return <i>{t('ai:This IP will be allocated by the DHCP server')}</i>;
};

export type VirtualIPControlGroupProps = {
  cluster: Cluster;
  hostSubnets: HostSubnets;
  isVipDhcpAllocationDisabled?: boolean;
  supportLevel?: SupportLevel;
  isViewerMode?: boolean;
};

export const VirtualIPControlGroup = ({
  cluster,
  hostSubnets,
  isVipDhcpAllocationDisabled,
  supportLevel,
  isViewerMode = false,
}: VirtualIPControlGroupProps) => {
  const { values, setFieldValue } = useFormikContext<NetworkConfigurationValues>();
  const { t } = useTranslation();

  const vipHelperSuffix = getVipHelperSuffix(
    t,
    selectApiVip(cluster),
    cluster.vipDhcpAllocation,
    values.vipDhcpAllocation,
  );
  const apiVipHelperText = t(
    'ai:Provide an endpoint for users, both human and machine, to interact with and configure the platform. If needed, contact your IT manager for more information. {{vipHelperSuffix}}',
    { vipHelperSuffix },
  );
  const ingressVipHelperText = t(
    'ai:Provide an endpoint for application traffic flowing in from outside the cluster. If needed, contact your IT manager for more information. {{vipHelperSuffix}}',
    { vipHelperSuffix },
  );
  const apiVipPopoverContent = t(
    'ai:Provides an endpoint for users, both human and machine, to interact with and configure the platform.',
  );
  const ingressVipPopoverContent = t(
    'ai:Provides an endpoint for application traffic flowing in from outside the cluster.',
  );

  const {
    'api-vips-defined': apiVipFailedValidationMessage,
    'ingress-vips-defined': ingressVipFailedValidationMessage,
  } = React.useMemo(
    () => getVipValidationsById(t, cluster.validationsInfo),
    [t, cluster.validationsInfo],
  );

  const enableAllocation = values.networkType === NETWORK_TYPE_SDN;
  const isDualStack = values.stackType === DUAL_STACK;
  const isVipInputDisabled = !hostSubnets.length || values.hostSubnet === NO_SUBNET_SET;

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

  const setVipValueAtIndex = (
    field: 'apiVips' | 'ingressVips',
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const fieldArray: ApiVip[] =
      field === 'apiVips' ? values.apiVips || [] : values.ingressVips || [];
    const next: ApiVip[] = Array.isArray(fieldArray) ? [...fieldArray] : [];
    // Ensure array has the desired length
    while (next.length <= index) {
      next.push({ ip: '', clusterId: cluster.id });
    }
    next[index] = { ip: e.target.value, clusterId: cluster.id };
    setFieldValue(field, next, true);
  };

  return (
    <>
      {!isVipDhcpAllocationDisabled && (
        <CheckboxField
          onChange={onChangeDhcp}
          label={
            <>
              <Tooltip
                hidden={enableAllocation}
                content={t(
                  "ai:A cluster with OVN networking type cannot use 'allocate IPs via DHCP server'",
                )}
              >
                <span>{t('ai:Allocate IPs via DHCP server')}</span>
              </Tooltip>
              <NewFeatureSupportLevelBadge featureId="VIP_AUTO_ALLOC" supportLevel={supportLevel} />
            </>
          }
          name="vipDhcpAllocation"
          isDisabled={!enableAllocation || isViewerMode}
        />
      )}
      {values.vipDhcpAllocation ? (
        <>
          <FormikStaticField
            label={
              <>
                <span>{t('ai:API IP')}</span> <PopoverIcon bodyContent={apiVipPopoverContent} />
              </>
            }
            name="apiVips.0.ip"
            helperText={apiVipHelperText}
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
                <span>{t('ai:Ingress IP')}</span> <PopoverIcon bodyContent={ingressVipPopoverContent} />
              </>
            }
            name="ingressVips.0.ip"
            helperText={ingressVipHelperText}
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
                  <InputField
                    label={
                      <>
                        <span>{t('ai:API IP')}</span> <PopoverIcon bodyContent={apiVipPopoverContent} />
                      </>
                    }
                    name="apiVips.0.ip"
                    helperText={apiVipHelperText}
                    isRequired
                    maxLength={45}
                    isDisabled={isVipInputDisabled || isViewerMode}
                    labelInfo={isDualStack ? t('ai:Primary') : undefined}
                    onChange={(e) =>
                      setVipValueAtIndex('apiVips', 0, e as React.ChangeEvent<HTMLInputElement>)
                    }
                  />
                </StackItem>
                {isDualStack && (
                  <StackItem>
                    <InputField
                      label={
                        <>
                          <span>{t('ai:API IP')}</span> <PopoverIcon bodyContent={apiVipPopoverContent} />
                        </>
                      }
                      name="apiVips.1.ip"
                      maxLength={45}
                      //helperText={apiVipHelperText}
                      isDisabled={isVipInputDisabled || isViewerMode}
                      labelInfo={t('ai:Secondary')}
                      onChange={(e) =>
                        setVipValueAtIndex('apiVips', 1, e as React.ChangeEvent<HTMLInputElement>)
                      }
                    />
                  </StackItem>
                )}
                <StackItem>
                  <InputField
                    name="ingressVips.0.ip"
                    label={
                      <>
                        <span>{t('ai:Ingress IP')}</span> <PopoverIcon bodyContent={ingressVipPopoverContent} />
                      </>
                    }
                    helperText={ingressVipHelperText}
                    isRequired
                    maxLength={45}
                    isDisabled={isVipInputDisabled || isViewerMode}
                    labelInfo={isDualStack ? t('ai:Primary') : undefined}
                    onChange={(e) =>
                      setVipValueAtIndex('ingressVips', 0, e as React.ChangeEvent<HTMLInputElement>)
                    }
                  />
                </StackItem>
                {isDualStack && (
                  <StackItem>
                    <InputField
                      name="ingressVips.1.ip"
                      label={
                        <>
                          <span>{t('ai:Ingress IP')}</span> <PopoverIcon bodyContent={ingressVipPopoverContent} />
                        </>
                      }
             
                      maxLength={45}
           
                      helperText={ingressVipHelperText}
                      isDisabled={isVipInputDisabled || isViewerMode}
                      labelInfo={t('ai:Secondary')}
                      onChange={(e) =>
                        setVipValueAtIndex(
                          'ingressVips',
                          1,
                          e as React.ChangeEvent<HTMLInputElement>,
                        )
                      }
                    />
                  </StackItem>
                )}
              </Stack>
            )}
          </FieldArray>
        </FormGroup>
      )}
    </>
  );
};
