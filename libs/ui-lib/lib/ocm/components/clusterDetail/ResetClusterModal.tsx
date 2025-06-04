import React from 'react';
import { useDispatch } from 'react-redux';
import {
	Button,
	ButtonVariant,
	Content,
	
} from '@patternfly/react-core';
import {
	Modal,
	ModalVariant
} from '@patternfly/react-core/deprecated';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';

import { getApiErrorMessage, handleApiError } from '../../../common/api';
import { updateCluster } from '../../store/slices/current-cluster/slice';
import { calculateCollectedLogsCount } from '../clusters/utils';
import { useModalDialogsContext } from '../hosts/ModalDialogsContext';
import { ErrorState, LoadingState, UiIcon } from '../../../common';
import { ClustersAPI } from '../../services/apis';

const ResetClusterModal: React.FC = () => {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<{ title: string; message: string } | null>(null);
  const { resetClusterDialog } = useModalDialogsContext();
  const { data, isOpen, close: onClose } = resetClusterDialog;
  const cluster = data?.cluster;

  if (!cluster) {
    return null;
  }

  const handleClose = () => {
    setIsSubmitting(false);
    setError(null);
    onClose();
  };

  const handleReset = () => {
    const doItAsync = async () => {
      setIsSubmitting(true);
      try {
        setError(null);
        const { data } = await ClustersAPI.reset(cluster.id);
        dispatch(updateCluster(data));
        onClose();
      } catch (e) {
        handleApiError(e, () => {
          setError({
            title: 'Failed to reset cluster installation',
            message: getApiErrorMessage(e),
          });
        });
      }
      setIsSubmitting(false);
    };
    void doItAsync();
  };

  const collectedLogsPercentage = `${Math.round(
    (calculateCollectedLogsCount(cluster) / ((cluster.hosts?.length || 0) + 1)) * 100,
  )} `;

  const getModalContent = () => {
    if (isSubmitting) {
      return <LoadingState content="Resetting cluster installation..." />;
    }

    if (error) {
      return <ErrorState title={error.title} content={error.message} />;
    }

    return (
      <Content>
        <Content component="p">
          This will reset the installation and return to the cluster configuration. Some hosts may
          need to be re-registered by rebooting into the Discovery ISO.
        </Content>

        <Content component="p">
          <strong>Download the installation logs</strong> to troubleshoot or report a bug.
          <br />
          Currently, {collectedLogsPercentage}% of the installation logs were collected and are
          ready for download.
        </Content>

        <Content component="p">
          <UiIcon size="sm" status="warning" icon={<ExclamationTriangleIcon />} /> Logs won't be
          available after the installation is reset.
        </Content>

        <Content component="p">Are you sure you want to reset the cluster?</Content>
      </Content>
    );
  };

  const actions = [
    <Button
      key="reset"
      variant={ButtonVariant.danger}
      onClick={handleReset}
      isDisabled={isSubmitting}
    >
      Reset Cluster
    </Button>,
  ];

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
