import * as React from 'react';
import { Modal, ModalVariant } from '@patternfly/react-core';
import BMCForm from '../Agent/BMCForm';
import { AddHostModalProps } from './types';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';

const AddBmcHostModal: React.FC<AddHostModalProps> = ({
  isOpen,
  onClose,
  infraEnv,
  onCreateBMH,
  usedHostnames,
}) => {
  const hasDHCP = infraEnv.metadata?.labels?.networkType !== 'static';
  const { t } = useTranslation();
  return (
    <Modal
      aria-label={t('ai:Add BMC host dialog')}
      title={t('ai:Add host using Baseboard Management Controller (BMC)')}
      isOpen={isOpen}
      onClose={onClose}
      variant={ModalVariant.medium}
      hasNoBodyWrapper
      id="add-host-modal"
    >
      <BMCForm
        onCreateBMH={onCreateBMH}
        onClose={onClose}
        hasDHCP={hasDHCP}
        infraEnv={infraEnv}
        usedHostnames={usedHostnames}
      />
    </Modal>
  );
};

export default AddBmcHostModal;
