import React from 'react';
import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
} from '@patternfly/react-core';
import { getCamelCasedClusterObject } from './utils';
import { Cluster } from '../../api/types';

type ClusterMetworkDetailsProps = {
  cluster: Cluster;
};

const ClusterNetworkDetails: React.FC<ClusterMetworkDetailsProps> = ({ cluster }) => {
  console.log('cluster', cluster);
  const clusterObj = getCamelCasedClusterObject(cluster);
  return (
    <>
      <DescriptionListGroup>
        <DescriptionListTerm>Network</DescriptionListTerm>
        <DescriptionListDescription>
          <dl className="pf-l-stack">
            {clusterObj.machineNetworkCidr && (
              <Flex>
                <dt>Machine CIDR: </dt>
                <dd>{clusterObj.machineNetworkCidr}</dd>
              </Flex>
            )}
            {clusterObj.serviceNetworkCidr && (
              <Flex>
                <dt>Service CIDR: </dt>
                <dd>{clusterObj.serviceNetworkCidr}</dd>
              </Flex>
            )}
            {clusterObj.clusterNetworkCidr && (
              <Flex>
                <dt>Pod CIDR: </dt>
                <dd>{clusterObj.clusterNetworkCidr}</dd>
              </Flex>
            )}
          </dl>
        </DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>Additional Information</DescriptionListTerm>
        <DescriptionListDescription>
          <dl className="pf-l-stack">
            {clusterObj.additionalNtpSource && (
              <Flex>
                <dt>NTP Server: </dt>
                <dd>{clusterObj.additionalNtpSource}</dd>
              </Flex>
            )}
            {clusterObj.apiVip && (
              <Flex>
                <dt>API VIP: </dt>
                <dd>{clusterObj.apiVip}</dd>
              </Flex>
            )}
            {clusterObj.ingressVip && (
              <Flex>
                <dt>Ingress VIP: </dt>
                <dd>{clusterObj.ingressVip}</dd>
              </Flex>
            )}
          </dl>
        </DescriptionListDescription>
      </DescriptionListGroup>
    </>
  );
};

export default ClusterNetworkDetails;
