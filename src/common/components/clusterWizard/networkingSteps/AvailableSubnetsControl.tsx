import React from 'react';
import { Alert, AlertActionLink, AlertVariant, Popover } from '@patternfly/react-core';
import { HostSubnet, HostSubnets } from '../../../types/clusters';
import { Cluster, Host } from '../../../api';
import { SelectField } from '../../ui';
import { NO_SUBNET_SET } from '../../../config';
import { useTranslation } from '../../../hooks/use-translation-wrapper';

interface SubnetHelperTextProps {
  matchingSubnet: HostSubnet;
  hosts: Cluster['hosts'];
}

const SubnetHelperText = ({ matchingSubnet, hosts }: SubnetHelperTextProps) => {
  const { t } = useTranslation();
  const excludedHosts =
    hosts?.filter(
      (host) =>
        !['disabled', 'disconnected'].includes(host.status) &&
        !matchingSubnet.hostIDs.includes(host.requestedHostname || ''),
    ) || [];

  // Workaround for bug in CIM backend. hostIDs are empty
  if (excludedHosts.length === 0 || !matchingSubnet.hostIDs.length) {
    return null;
  }

  const actionLinks = (
    <Popover
      position="right"
      bodyContent={
        <ul>
          {excludedHosts
            .sort(
              (hostA, hostB) =>
                hostA.requestedHostname?.localeCompare(hostB.requestedHostname || '') || 0,
            )
            .map((host) => (
              <li key={host.id}>{host.requestedHostname || host.id}</li>
            ))}
        </ul>
      }
      minWidth="30rem"
      maxWidth="50rem"
    >
      <AlertActionLink id="form-input-hostSubnet-field-helper-view-excluded">
        {t('ai:View {{count}} affected host', {
          count: excludedHosts.length,
        })}
      </AlertActionLink>
    </Popover>
  );

  return (
    <Alert
      title={t('ai:This subnet range is not available on all hosts')}
      variant={AlertVariant.warning}
      actionLinks={actionLinks}
      isInline
    >
      {t('ai:Hosts outside of this range will not be included in the new cluster.')}
    </Alert>
  );
};

export interface AvailableSubnetsControlProps {
  hostSubnets: HostSubnets;
  hosts: Host[];
  isRequired: boolean;
  isMultiNodeCluster: boolean;
}

export const AvailableSubnetsControl = ({
  hostSubnets,
  hosts,
  isRequired = false,
  isMultiNodeCluster,
}: AvailableSubnetsControlProps) => {
  const { t } = useTranslation();
  const getHelperText = (value: string) => {
    const matchingSubnet = hostSubnets.find((hn) => hn.subnet === value);
    if (matchingSubnet) {
      return (
        isMultiNodeCluster && <SubnetHelperText matchingSubnet={matchingSubnet} hosts={hosts} />
      );
    }

    return undefined;
  };
  const hostSubnetLength = hostSubnets.length;
  return (
    <SelectField
      name="hostSubnet"
      label={t('ai:Available subnets')}
      options={
        hostSubnets.length
          ? [
              {
                label: t('ai:Please select a subnet. ({{hostSubnetLength}} available)', {
                  hostSubnetLength,
                }),
                value: NO_SUBNET_SET,
                isDisabled: true,
                id: 'form-input-hostSubnet-field-option-no-subnet',
              },
              ...hostSubnets
                .sort((subA, subB) => subA.humanized.localeCompare(subB.humanized))
                .map((hn, index) => ({
                  label: hn.humanized,
                  value: hn.subnet,
                  id: `form-input-hostSubnet-field-option-${index}`,
                })),
            ]
          : [
              {
                label: t('ai:No subnets are currently available'),
                value: NO_SUBNET_SET,
              },
            ]
      }
      getHelperText={getHelperText}
      isDisabled={!hostSubnets.length}
      isRequired={isRequired}
    />
  );
};
