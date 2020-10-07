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
import { updateCluster } from '../../features/clusters/currentClusterSlice';
import { canDownloadClusterLogs } from '../hosts/utils';
import { downloadClusterInstallationLogs } from './utils';
import { AlertsContext } from '../AlertsContextProvider';

type ResetClusterModalButtonProps = React.ComponentProps<typeof Button> & {
  ButtonComponent?: typeof Button | typeof ToolbarButton | typeof AlertActionLink;
  clusterId: Cluster['id'];
};

type ResetClusterModalProps = {
  onClose: () => void;
  isOpen: boolean;
  cluster: Cluster;
};

const ResetClusterModal: React.FC<ResetClusterModalProps> = ({ onClose, isOpen, cluster }) => {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<{ title: string; message: string } | null>(null);
  const { addAlert } = React.useContext(AlertsContext);

  const areLogsAvailable = canDownloadClusterLogs(cluster);

  const handleClose = () => {
    setIsSubmitting(false);
    setError(null);
    onClose();
  };

  const doReset = async () => {
    setIsSubmitting(true);
    try {
      setError(null);
      const { data } = await postResetCluster(cluster.id);
      dispatch(updateCluster(data));
      onClose();
    } catch (e) {
      handleApiError(e, () => {
        setError({ title: 'Failed to reset cluster installation', message: getErrorMessage(e) });
      });
    }
    setIsSubmitting(false);
  };

  const doDownloadAndReset = async () => {
    setIsSubmitting(true);
    if (await downloadClusterInstallationLogs(addAlert, cluster.id)) {
      doReset();
    }
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
        {areLogsAvailable && (
          <Text component="p">
            Existing installation logs will be deleted and will not be available once installation
            reset is performed. Logs need to be attached when reporting a bug. Shall the logs be
            downloaded?
          </Text>
        )}
      </TextContent>
    );
  };

  const actions = [];
  if (areLogsAvailable) {
    actions.push(
      <Button key="submit" onClick={doDownloadAndReset} isDisabled={isSubmitting}>
        Download & Reset Cluster
      </Button>,
    );
    actions.push(
      <Button
        key="forgetAndReset"
        variant={ButtonVariant.link}
        onClick={doReset}
        isDisabled={isSubmitting}
      >
        Forget logs & Reset
      </Button>,
    );
  } else {
    actions.push(
      <Button key="submit" onClick={doReset} isDisabled={isSubmitting}>
        Reset Cluster
      </Button>,
    );
  }
  actions.push(
    <Button
      key="cancel"
      variant={ButtonVariant.link}
      onClick={handleClose}
      isDisabled={isSubmitting}
    >
      Cancel
    </Button>,
  );

  return (
    <Modal
      title="Reset Cluster Installation"
      isOpen={isOpen}
      variant={ModalVariant.small}
      actions={actions}
      onClose={handleClose}
    >
      {getModalContent()}
    </Modal>
  );
};

export default ResetClusterModal;
