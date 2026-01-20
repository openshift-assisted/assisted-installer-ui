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
import { NetworkConfigurationValues, HostSubnets } from '../../../types';
import { NETWORK_TYPE_SDN, DUAL_STACK } from '../../../config';
import { selectMachineNetworkCIDR, selectApiVip, selectIngressVip } from '../../../selectors';
import { getVipValidationsById } from '../../clusterConfiguration';
import { FormikStaticField, PopoverIcon } from '../../ui';
import { CheckboxField, InputField } from '../../ui/formik';
import { useTranslation } from '../../../hooks/use-translation-wrapper';
import NewFeatureSupportLevelBadge from '../../newFeatureSupportLevels/NewFeatureSupportLevelBadge';
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

  const apiVipPopoverContent = t(
    'ai:Provides an endpoint for users, both human and machine, to interact with and configure the platform. If needed, contact your IT manager for more information.',
  );
  const ingressVipPopoverContent = t(
    'ai:Provides an endpoint for application traffic flowing in from outside the cluster. If needed, contact your IT manager for more information.',
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
  const isVipInputDisabled = !hostSubnets.length || !values.machineNetworks?.[0]?.cidr;

  React.useEffect(() => {
    if (!isViewerMode && !enableAllocation) {
      setFieldValue('vipDhcpAllocation', false);
    }
  }, [enableAllocation, isViewerMode, setFieldValue]);

  // Ensure VIP arrays exist when (re-)entering cluster-managed networking.
  React.useEffect(() => {
    if (
      isViewerMode ||
      values.managedNetworkingType !== 'clusterManaged' ||
      values.vipDhcpAllocation
    ) {
      return;
    }

    const vipCount = values.stackType === DUAL_STACK ? 2 : 1;
    const blankVipEntriesArray = Array.from({ length: vipCount }, () => ({
      ip: '',
      clusterId: cluster.id,
    }));

    const apiVipsEmpty = !values.apiVips || values.apiVips.length === 0;
    const ingressVipsEmpty = !values.ingressVips || values.ingressVips.length === 0;

    if (apiVipsEmpty) {
      setFieldValue('apiVips', blankVipEntriesArray, false);
    }
    if (ingressVipsEmpty) {
      setFieldValue('ingressVips', blankVipEntriesArray, false);
    }
  }, [
    cluster.id,
    isViewerMode,
    setFieldValue,
    values.apiVips,
    values.ingressVips,
    values.managedNetworkingType,
    values.stackType,
    values.vipDhcpAllocation,
  ]);

  const onChangeDhcp = React.useCallback(
    (hasDhcp: boolean) => {
      // We need to sync the values back to the form
      setFieldValue('apiVips', hasDhcp ? [] : cluster.apiVips, true);
      setFieldValue('ingressVips', hasDhcp ? [] : cluster.ingressVips, true);
    },
    [cluster.apiVips, cluster.ingressVips, setFieldValue],
  );

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
                <span>{t('ai:Ingress IP')}</span>{' '}
                <PopoverIcon bodyContent={ingressVipPopoverContent} />
              </>
            }
            name="ingressVips.0.ip"
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
                        <span>{t('ai:API IP')}</span>{' '}
                        <PopoverIcon bodyContent={apiVipPopoverContent} />
                      </>
                    }
                    name="apiVips.0.ip"
                    isRequired
                    maxLength={45}
                    isDisabled={isVipInputDisabled || isViewerMode}
                    labelInfo={isDualStack ? t('ai:Primary') : undefined}
                  />
                </StackItem>
                {isDualStack && (
                  <StackItem>
                    <InputField
                      label={
                        <>
                          <span>{t('ai:API IP')}</span>{' '}
                          <PopoverIcon bodyContent={apiVipPopoverContent} />
                        </>
                      }
                      name="apiVips.1.ip"
                      maxLength={45}
                      isRequired
                      isDisabled={isVipInputDisabled || isViewerMode}
                      labelInfo={t('ai:Secondary')}
                    />
                  </StackItem>
                )}
                <StackItem>
                  <InputField
                    name="ingressVips.0.ip"
                    label={
                      <>
                        <span>{t('ai:Ingress IP')}</span>{' '}
                        <PopoverIcon bodyContent={ingressVipPopoverContent} />
                      </>
                    }
                    isRequired
                    maxLength={45}
                    isDisabled={isVipInputDisabled || isViewerMode}
                    labelInfo={isDualStack ? t('ai:Primary') : undefined}
                  />
                </StackItem>
                {isDualStack && (
                  <StackItem>
                    <InputField
                      name="ingressVips.1.ip"
                      label={
                        <>
                          <span>{t('ai:Ingress IP')}</span>{' '}
                          <PopoverIcon bodyContent={ingressVipPopoverContent} />
                        </>
                      }
                      maxLength={45}
                      isRequired
                      isDisabled={isVipInputDisabled || isViewerMode}
                      labelInfo={t('ai:Secondary')}
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
