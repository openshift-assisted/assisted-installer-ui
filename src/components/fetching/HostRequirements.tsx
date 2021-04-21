import React from 'react';
import { Button, ButtonVariant, Modal, ModalVariant, TextContent } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';
import { LoadingState } from '../ui';

import './HostRequirements.css';
import { useClusterPreflightRequirementsContext } from '../clusterConfiguration/ClusterPreflightRequirementsContext';

export type HostRequirementsLinkProps = {
  ContentComponent: React.FC;
};

type HostRequirementsModalProps = HostRequirementsLinkProps & {
  isOpen: boolean;
  setHostRequirementsOpen: (isOpen: boolean) => void;
};

const HostRequirementsModal: React.FC<HostRequirementsModalProps> = ({
  setHostRequirementsOpen,
  isOpen,
  ContentComponent,
}) => {
  const { preflightRequirements } = useClusterPreflightRequirementsContext();
  const onClose = React.useCallback(() => setHostRequirementsOpen(false), [
    setHostRequirementsOpen,
  ]);

  return (
    <Modal
      title="Minimum hardware requirements"
      isOpen={isOpen}
      actions={[
        <Button key="close" variant={ButtonVariant.primary} onClick={onClose}>
          Close
        </Button>,
      ]}
      onClose={onClose}
      variant={ModalVariant.medium}
    >
      {preflightRequirements ? (
        <TextContent>
          <ContentComponent />
        </TextContent>
      ) : (
        <LoadingState content="Loading hardware requirements ..." />
      )}
    </Modal>
  );
};

export const HostRequirementsLink: React.FC<HostRequirementsLinkProps> = (props) => {
  const [isHostRequirementsOpen, setHostRequirementsOpen] = React.useState(false);

  return (
    <>
      <Button
        variant={ButtonVariant.link}
        onClick={() => setHostRequirementsOpen(true)}
        isInline
        className="host-requirements-link"
      >
        <InfoCircleIcon size="sm" />
        &nbsp;Minimum hardware requirements
      </Button>
      <HostRequirementsModal
        {...props}
        isOpen={isHostRequirementsOpen}
        setHostRequirementsOpen={setHostRequirementsOpen}
      />
    </>
  );
};
