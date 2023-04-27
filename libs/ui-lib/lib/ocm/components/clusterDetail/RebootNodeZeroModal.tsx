import React from 'react';
import { Button, Checkbox, Modal, ModalVariant, Text, TextContent } from '@patternfly/react-core';

import { useClusterStatusVarieties } from './ClusterDetailStatusVarieties';
import { Cluster, KubeconfigDownload, ClusterCredentials } from '../../../common';

import './RebootNodeZeroModal.css';

// TODO(mlibra): Following will be reimplemented based on future decisions in https://issues.redhat.com/browse/AGENT-522
export const RebootNodeZeroModal: React.FC<{ cluster: Cluster }> = ({ cluster }) => {
  const [rebootConfirmed, setRebootCofirmed] = React.useState(false);
  const clusterVarieties = useClusterStatusVarieties(cluster);
  const { credentials, credentialsError, fetchCredentials } = clusterVarieties;

  const onReboot = () => {
    console.error('onReboot handler to be implemented');
    // TODO(mlibra): Make HTTP Rest call to the assisted-service to restart the node, such endpoint is not yet implemented
  };

  // Do not merge, development only:
  // credentials = credentials || {
  //   username: 'mock-user',
  //   password: 'mock-password',
  //   consoleUrl: 'https://www.google.com/search?q=mock',
  // };

  return (
    <Modal
      title="Reboot node?"
      className="ai-reboot-modal"
      isOpen={true}
      variant={ModalVariant.medium}
      actions={[
        <Button key="reboot" onClick={onReboot} isDisabled={!rebootConfirmed}>
          Reboot
        </Button>,
      ]}
    >
      <TextContent>
        <Text>
          This node is about to reboot. Make sure you have downloaded the kubeconfig before you
          proceed to reboot.
        </Text>
      </TextContent>
      <KubeconfigDownload
        status={cluster.status}
        clusterId={cluster.id}
        className="ai-reboot-modal__item"
        data-testid="button-download-kubeconfig"
      />
      <ClusterCredentials
        cluster={cluster}
        credentials={credentials}
        error={!!credentialsError}
        retry={fetchCredentials}
        credentialsError={credentialsError}
      />
      <Checkbox
        label="I have downloaded the kubeconfig, saved the credentials and the node is ready to reboot"
        className="ai-reboot-modal__item"
        isChecked={rebootConfirmed}
        onChange={() => setRebootCofirmed(!rebootConfirmed)}
        id="checkbox-confirm-reboot"
        name="confirm-reboot"
      />
    </Modal>
  );
};
