import React from 'react';
import { Grid, TextInputTypes } from '@patternfly/react-core';
import { useFormikContext } from 'formik';
import { InputField } from '../../components/ui';
import { NetworkConfigurationValues } from '../../types/clusters';
import { PREFIX_MAX_RESTRICTION } from '../../config/constants';
import { NetworkTypeControlGroup } from '../clusterWizard/networkingSteps/NetworkTypeControlGroup';
import { useFeature } from '../../features';
import { useTranslation } from '../../hooks/use-translation-wrapper';

type AdvancedNetworkFieldsProps = {
  isSDNSelectable: boolean;
  isClusterCIDRIPv6: boolean;
};

const AdvancedNetworkFields: React.FC<AdvancedNetworkFieldsProps> = ({
  isSDNSelectable,
  isClusterCIDRIPv6,
}) => {
  const isNetworkTypeSelectionEnabled = useFeature(
    'ASSISTED_INSTALLER_NETWORK_TYPE_SELECTION_FEATURE',
  );
  const { setFieldValue, values } = useFormikContext<NetworkConfigurationValues>();
  const clusterNetworkCidrPrefix = parseInt((values.clusterNetworkCidr || '').split('/')[1]) || 1;
  const { t } = useTranslation();
  const formatClusterNetworkHostPrefix = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isNaN(parseInt(e.target.value))) {
      setFieldValue('clusterNetworkHostPrefix', clusterNetworkCidrPrefix);
    }
  };

  const clusterNetworkHostPrefixHelperText = isClusterCIDRIPv6
    ? t(
        'ai:The subnet prefix length to assign to each individual node. For example, if Cluster Network Host Prefix is set to 116, then each node is assigned a /116 subnet out of the given cidr (clusterNetworkCIDR), which allows for 4,094 (2^(128 - 116) - 2) pod IPs addresses. If you are required to provide access to nodes from an external network, configure load balancers and routers to manage the traffic.',
      )
    : t(
        'ai:The subnet prefix length to assign to each individual node. For example, if Cluster Network Host Prefix is set to 23, then each node is assigned a /23 subnet out of the given cidr (clusterNetworkCIDR), which allows for 510 (2^(32 - 23) - 2) pod IPs addresses. If you are required to provide access to nodes from an external network, configure load balancers and routers to manage the traffic.',
      );

  return (
    <Grid hasGutter>
      <InputField
        name="clusterNetworkCidr"
        label={t('ai:Cluster network CIDR')}
        helperText={t(
          'ai:IP address block from which Pod IPs are allocated This block must not overlap with existing physical networks. These IP addresses are used for the Pod network, and if you need to access the Pods from an external network, configure load balancers and routers to manage the traffic.',
        )}
        isRequired
      />
      <InputField
        name="clusterNetworkHostPrefix"
        label={t('ai:Cluster network host prefix')}
        type={TextInputTypes.number}
        min={clusterNetworkCidrPrefix}
        max={isClusterCIDRIPv6 ? PREFIX_MAX_RESTRICTION.IPv6 : PREFIX_MAX_RESTRICTION.IPv4}
        onBlur={(e) => formatClusterNetworkHostPrefix(e as React.ChangeEvent<HTMLInputElement>)}
        helperText={clusterNetworkHostPrefixHelperText}
        isRequired
      />
      <InputField
        name="serviceNetworkCidr"
        label={t('ai:Service network CIDR')}
        helperText={t(
          'ai:The IP address pool to use for service IP addresses. You can enter only one IP address pool. If you need to access the services from an external network, configure load balancers and routers to manage the traffic.',
        )}
        isRequired
      />
      {isNetworkTypeSelectionEnabled && (
        <NetworkTypeControlGroup isSDNSelectable={isSDNSelectable} />
      )}
    </Grid>
  );
};

export default AdvancedNetworkFields;
