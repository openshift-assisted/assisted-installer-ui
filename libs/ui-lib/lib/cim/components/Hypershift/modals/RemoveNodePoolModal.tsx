import * as React from 'react';
import {
	Alert,
	Button,
	Spinner,
	Stack,
	StackItem
} from '@patternfly/react-core';
import {
	Modal,
	ModalBoxBody,
	ModalBoxFooter,
	ModalVariant
} from '@patternfly/react-core/deprecated';
import { NodePoolK8sResource } from '../types';
import { getErrorMessage } from '../../../../common/utils';
import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';

type RemoveNodePoolModalProps = {
  nodePool: NodePoolK8sResource;
  onClose: VoidFunction;
  onRemove: (nodePool: NodePoolK8sResource) => Promise<unknown>;
};

const RemoveNodePoolModal = ({ onClose, onRemove, nodePool }: RemoveNodePoolModalProps) => {
  const { t } = useTranslation();
  const [isRemoving, setIsRemoving] = React.useState(false);
  const [error, setError] = React.useState<string>();
  return (
    <Modal
      aria-label="remove node pool dialog"
      title={t('ai:Remove nodepool')}
      isOpen
      onClose={onClose}
      variant={ModalVariant.small}
      hasNoBodyWrapper
      titleIconVariant="warning"
    >
      <ModalBoxBody>
        <Stack hasGutter>
          <StackItem>
            {t(
              'ai:Removing {{name}} will remove the association with {{count}} host. These hosts will become available for other nodepools.',
              { name: nodePool.metadata?.name || '', count: nodePool.spec.replicas },
            )}
          </StackItem>
          {error && (
            <StackItem>
              <Alert variant="danger" isInline title={error} />
            </StackItem>
          )}
        </Stack>
      </ModalBoxBody>
      <ModalBoxFooter>
        <Button
          onClick={() => {
            const remove = async () => {
              try {
                setError(undefined);
                setIsRemoving(true);
                await onRemove(nodePool);
                onClose();
              } catch (err) {
                setError(getErrorMessage(err));
              } finally {
                setIsRemoving(false);
              }
            };
            void remove();
          }}
          isDisabled={isRemoving}
          variant="danger"
          icon={isRemoving ? <Spinner size="md" /> : undefined}
        >
          {t('ai:Remove')}
        </Button>
        <Button variant="link" onClick={onClose}>
          {t('ai:Cancel')}
        </Button>
      </ModalBoxFooter>
    </Modal>
  );
};

export default RemoveNodePoolModal;
