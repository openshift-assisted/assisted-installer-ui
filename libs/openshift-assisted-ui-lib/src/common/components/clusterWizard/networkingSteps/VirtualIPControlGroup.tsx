import React from 'react';
import { useFormikContext } from 'formik';
import { Spinner, Alert, AlertVariant } from '@patternfly/react-core';
import { Cluster } from '../../../api';
import { HostSubnets, NetworkConfigurationValues } from '../../../types';
import { CheckboxField, FormikStaticField, InputField } from '../../ui';
import { NO_SUBNET_SET } from '../../../config';
import { FeatureSupportLevelBadge } from '../../featureSupportLevels';
import { useTranslation } from '../../../hooks/use-translation-wrapper';
import { TFunction } from 'i18next';
import { getVipValidationsById } from '../../clusterConfiguration';

interface VipStaticValueProps {
  vipName: 'apiVip' | 'ingressVip';
  cluster: Cluster;
  validationErrorMessage?: string;
}

const VipStaticValue = ({ vipName, cluster, validationErrorMessage }: VipStaticValueProps) => {
  const { vipDhcpAllocation, machineNetworkCidr } = cluster;
  const { t } = useTranslation();
  if (vipDhcpAllocation && cluster[vipName]) {
    return <>{cluster[vipName]}</>;
  }
  if (vipDhcpAllocation && validationErrorMessage) {
    return (
      <Alert
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
        <Spinner size="md" />
        <i>{t('ai:This IP is being allocated by the DHCP server')}</i>
      </>
    );
  }
  return <>{t('ai:<i>This IP will be allocated by the DHCP server</i>')}</>;
};

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
  const { values } = useFormikContext<NetworkConfigurationValues>();
  const { t } = useTranslation();
  const vipHelperSuffix = getVipHelperSuffix(
    t,
    cluster.apiVip,
    cluster.vipDhcpAllocation,
    values.vipDhcpAllocation,
  );
  const apiVipHelperText = t(
    'ai:Provide an endpoint for users, both human and machine, to interact with and configure the platform. If needed, contact your IT manager for more information. {{vipHelperSufix}}',
    {
      vipHelperSuffix: vipHelperSuffix,
    },
  );
  const ingressVipHelperText = t(
    'ai:Provide an endpoint for application traffic flowing in from outside the cluster. If needed, contact your IT manager for more information. {{vipHelperSufix}}',
    {
      vipHelperSuffix: vipHelperSuffix,
    },
  );

  const {
    'api-vip-defined': apiVipFailedValidationMessage,
    'ingress-vip-defined': ingressVipFailedValidationMessage,
  } = React.useMemo(
    () => getVipValidationsById(t, cluster.validationsInfo),
    [t, cluster.validationsInfo],
  );

  return (
    <>
      {!isVipDhcpAllocationDisabled && (
        <CheckboxField
          label={
            <>
              {t('ai:Allocate IPs via DHCP server')}
              <FeatureSupportLevelBadge
                featureId="VIP_AUTO_ALLOC"
                openshiftVersion={cluster.openshiftVersion}
              />
            </>
          }
          name="vipDhcpAllocation"
        />
      )}
      {values.vipDhcpAllocation ? (
        <>
          <FormikStaticField
            label={t('ai:API IP')}
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
            label={t('ai:Ingress IP')}
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
            label={t('ai:API IP')}
            name="apiVip"
            helperText={apiVipHelperText}
            isRequired
            isDisabled={!hostSubnets.length || values.hostSubnet === NO_SUBNET_SET}
          />
          <InputField
            name="ingressVip"
            label={t('ai:Ingress IP')}
            helperText={ingressVipHelperText}
            isRequired
            isDisabled={!hostSubnets.length || values.hostSubnet === NO_SUBNET_SET}
          />
        </>
      )}
    </>
  );
};
