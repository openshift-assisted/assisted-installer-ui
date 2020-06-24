import React from 'react';
import { useDispatch } from 'react-redux';
import {
  AlertActionLink,
  Button,
  Modal,
  ModalVariant,
  ButtonVariant,
  Text,
  TextContent,
} from '@patternfly/react-core';
import { ToolbarButton } from '../ui/Toolbar';
import { postResetCluster } from '../../api/clusters';
import { Cluster } from '../../api/types';
import { getErrorMessage, handleApiError } from '../../api/utils';
import LoadingState from '../ui/uiState/LoadingState';
import ErrorState from '../ui/uiState/ErrorState';
import { forceReload } from '../../features/clusters/currentClusterSlice';

type ResetClusterModalButtonProps = React.ComponentProps<typeof Button> & {
  ButtonComponent?: typeof Button | typeof ToolbarButton | typeof AlertActionLink;
  clusterId: Cluster['id'];
};

type ResetClusterModalProps = {
  onClose: () => void;
  isOpen: boolean;
  clusterId: Cluster['id'];
};

const ResetClusterModal: React.FC<ResetClusterModalProps> = ({ onClose, isOpen, clusterId }) => {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<{ title: string; message: string } | null>(null);

  const handleClose = () => {
    setIsSubmitting(false);
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      setError(null);
      await postResetCluster(clusterId);
      dispatch(forceReload());
    } catch (e) {
      handleApiError(e, () => {
        setError({ title: 'Failed to reset cluster installation', message: getErrorMessage(e) });
      });
    }
    setIsSubmitting(false);
    onClose();
  };

  const getModalContent = () => {
    if (isSubmitting) {
      return <LoadingState content="Resetting cluster installation..." />;
    }
    if (error) {
      return <ErrorState title={error.title} content={error.message} />;
    }
    return (
      <TextContent>
        <Text component="p">
          This will reset the installation and return to cluster configuration. Some hosts may need
          to be re-registered by rebooting into the Discovery ISO.
        </Text>
      </TextContent>
    );
  };

  return (
    <Modal
      title="Reset Cluster Installation"
      isOpen={isOpen}
      variant={ModalVariant.small}
      actions={[
        <Button key="submit" onClick={handleSubmit} isDisabled={isSubmitting}>
          Reset Cluster
        </Button>,
        <Button
          key="cancel"
          variant={ButtonVariant.link}
          onClick={handleClose}
          isDisabled={isSubmitting}
        >
          Cancel
        </Button>,
      ]}
      onClose={handleClose}
    >
      {getModalContent()}
    </Modal>
  );
};

export default ResetClusterModal;
