import React from 'react';
import { TextContent, Text, GridItem } from '@patternfly/react-core';
import { Cluster } from '../../api/types';
import { DetailList, DetailItem } from '../ui/DetailList';
import { isSingleNodeCluster } from '../clusters/utils';

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
    <GridItem md={6}>
      <DetailList>
        <DetailItem title="OpenShift version" value={cluster.openshiftVersion} />
        <DetailItem title="Base DNS domain" value={cluster.baseDnsDomain} />
        <DetailItem
          title="API virtual IP"
          value={cluster.apiVip}
          isHidden={isSingleNodeCluster(cluster)}
        />

        <DetailItem
          title="Ingress virtual IP"
          value={cluster.ingressVip}
          isHidden={isSingleNodeCluster(cluster)}
        />
      </DetailList>
    </GridItem>
    <GridItem md={6}>
      <DetailList>
        <DetailItem title="UUID" value={cluster.id} />
        <DetailItem title="Cluster network CIDR" value={cluster.clusterNetworkCidr} />
        <DetailItem title="Cluster network host prefix" value={cluster.clusterNetworkHostPrefix} />
        <DetailItem title="Service network CIDR" value={cluster.serviceNetworkCidr} />
      </DetailList>
    </GridItem>
  </>
);

export default ClusterProperties;
