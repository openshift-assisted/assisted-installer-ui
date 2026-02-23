import React from 'react';
import {
  Button,
  ButtonVariant,
  Content,
  Stack,
  StackItem,
  Alert,
  Modal,
  ModalVariant,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@patternfly/react-core';
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
      const hosts = cluster?.hosts;
      if (hosts) {
        for (const host of hosts) {
          await HostsService.unbind(host);
        }
      }
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

  return (
    <Modal isOpen={isOpen} variant={ModalVariant.small} onClose={handleClose}>
      <ModalHeader title={t('ai:Reset cluster')} titleIconVariant="warning" />
      <ModalBody>
        <Stack hasGutter>
          <StackItem>
            <Content>
              <Content component="p">
                {t(
                  'ai:This will remove all current configurations and will revert to the defaults.',
                )}
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
      </ModalBody>
      <ModalFooter>
        <Button
          key="reset"
          variant={ButtonVariant.danger}
          onClick={() => void handleResetAsync()}
          isDisabled={isLoading}
          isLoading={isLoading}
        >
          {t('ai:Reset')}
        </Button>
        <Button
          key="cancel"
          variant={ButtonVariant.link}
          onClick={handleClose}
          isDisabled={isLoading}
        >
          {t('ai:Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ResetSingleClusterModal;
