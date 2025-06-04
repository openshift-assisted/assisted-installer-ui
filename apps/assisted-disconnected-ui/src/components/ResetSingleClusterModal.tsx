import React from 'react';
import {
	Button,
	ButtonVariant,
	Content,
	Stack,
	StackItem,
	Alert
} from '@patternfly/react-core';
import {
	Modal,
	ModalVariant
} from '@patternfly/react-core/deprecated';
import { useModalDialogsContext, ClustersService } from '@openshift-assisted/ui-lib/ocm';
import {
  getApiErrorMessage,
  handleApiError,
  useTranslation,
} from '@openshift-assisted/ui-lib/common';
import { useNavigate } from 'react-router-dom-v5-compat';

const ResetSingleClusterModal: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<{ title: string; message: string }>();
  const { resetSingleClusterDialog } = useModalDialogsContext();
  const { data, isOpen, close: onClose } = resetSingleClusterDialog;
  const cluster = data?.cluster;
  const { t } = useTranslation();

  if (!cluster) {
    return null;
  }

  const handleClose = () => {
    setError(undefined);
    onClose();
  };

  const handleResetAsync = async () => {
    try {
      setError(undefined);
      setIsLoading(true);
      await ClustersService.remove(cluster.id);
      navigate(`/`);
    } catch (e) {
      handleApiError(e, () => {
        setError({
          title: t('ai:Failed to reset cluster installation'),
          message: getApiErrorMessage(e),
        });
      });
    } finally {
      setIsLoading(false);
    }
  };

  const actions = [
    <Button
      key="reset"
      variant={ButtonVariant.danger}
      onClick={() => void handleResetAsync()}
      isDisabled={isLoading}
      isLoading={isLoading}
    >
      {t('ai:Reset')}
    </Button>,
    <Button key="cancel" variant={ButtonVariant.link} onClick={handleClose} isDisabled={isLoading}>
      {t('ai:Cancel')}
    </Button>,
  ];

  return (
    <Modal
      title={t('ai:Reset cluster')}
      titleIconVariant="warning"
      isOpen={isOpen}
      variant={ModalVariant.small}
      actions={actions}
      onClose={handleClose}
    >
      <Stack hasGutter>
        <StackItem>
          <Content>
            <Content component="p">
              {t('ai:This will remove all current configurations and will revert to the defaults.')}
            </Content>

            <Content component="p">{t('ai:Are you sure you want to reset the cluster?')}</Content>
          </Content>
        </StackItem>
        {error && (
          <StackItem>
            <Alert isInline variant="danger" title={error.title}>
              {error.message}
            </Alert>
          </StackItem>
        )}
      </Stack>
    </Modal>
  );
};

export default ResetSingleClusterModal;
