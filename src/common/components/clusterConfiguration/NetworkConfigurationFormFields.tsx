import React from 'react';
import { Form } from '@patternfly/react-core';
import { TextContent, Text } from '@patternfly/react-core';
import NetworkConfiguration, { NetworkConfigurationProps } from './NetworkConfiguration';
import ClusterSshKeyFields from './ClusterSshKeyFields';
import { InfraEnv } from '../../api/types';

type NetworkConfigurationFormFieldsProps = NetworkConfigurationProps & {
  infraEnv: InfraEnv | undefined;
};

const NetworkConfigurationFormFields: React.FC<NetworkConfigurationFormFieldsProps> = ({
  ...props
}) => {
  const { cluster } = props;
  return (
    <Form>
      <NetworkConfiguration {...props} />
      <TextContent>
        <Text component="h2">Security</Text>
      </TextContent>
      <ClusterSshKeyFields
        clusterSshKey={cluster.sshPublicKey}
        imageSshKey={props.infraEnv?.sshAuthorizedKey}
      />
    </Form>
  );
};

export default NetworkConfigurationFormFields;
