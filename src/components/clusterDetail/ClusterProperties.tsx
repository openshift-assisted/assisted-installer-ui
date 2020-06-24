import React from 'react';
import { TextContent, Text, GridItem } from '@patternfly/react-core';
import { DASH } from '../constants';
import { Cluster } from '../../api/types';
import { DetailList, DetailItem } from '../ui/DetailList';
import { getHumanizedDateTime } from '../ui/utils';

type ClusterPropertiesProps = {
  cluster: Cluster;
};

const ClusterProperties: React.FC<ClusterPropertiesProps> = ({ cluster }) => (
  <>
    <GridItem>
      <TextContent>
        <Text component="h2">Cluster Details</Text>
      </TextContent>
    </GridItem>
    <GridItem md={6} lg={4} xl={3}>
      <DetailList>
        <DetailItem title="OpenShift version" value={cluster.openshiftVersion} />
        <DetailItem
          title="Installation started At"
          value={getHumanizedDateTime(cluster.installStartedAt)}
        />
        <DetailItem
          title="Installation finished At"
          value={
            cluster.status === 'installed' ? getHumanizedDateTime(cluster.installCompletedAt) : DASH
          }
        />
      </DetailList>
    </GridItem>
    <GridItem md={6} lg={4} xl={3}>
      <DetailList>
        <DetailItem title="Base DNS domain" value={cluster.baseDnsDomain} />
        <DetailItem title="API virtual IP" value={cluster.apiVip} />
        <DetailItem title="Ingress virtual IP" value={cluster.ingressVip} />
      </DetailList>
    </GridItem>
    <GridItem md={6} lg={4} xl={3}>
      <DetailList>
        <DetailItem title="Cluster network CIDR" value={cluster.clusterNetworkCidr} />
        <DetailItem title="Cluster network host prefix" value={cluster.clusterNetworkHostPrefix} />
        <DetailItem title="Service network CIDR" value={cluster.serviceNetworkCidr} />
      </DetailList>
    </GridItem>
  </>
);

export default ClusterProperties;
