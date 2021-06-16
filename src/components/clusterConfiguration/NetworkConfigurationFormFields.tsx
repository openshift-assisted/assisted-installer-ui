import React from 'react';
import { Form } from 'formik';
import { TextContent, Text } from '@patternfly/react-core';
import { HostSubnets } from '../../types/clusters';
import NetworkConfiguration from './NetworkConfiguration';
import ClusterSshKeyFields from './ClusterSshKeyFields';
import { Cluster } from '../../api';

const NetworkConfigurationFormFields: React.FC<{
  cluster: Cluster;
  hostSubnets: HostSubnets;
}> = ({ cluster, hostSubnets }) => {
  return (
    <Form>
      <NetworkConfiguration cluster={cluster} hostSubnets={hostSubnets} />
      <TextContent>
        <Text component="h2">Security</Text>
      </TextContent>
      <ClusterSshKeyFields
        clusterSshKey={cluster.sshPublicKey}
        imageSshKey={cluster.imageInfo.sshPublicKey}
      />
    </Form>
  );
};

export default NetworkConfigurationFormFields;
