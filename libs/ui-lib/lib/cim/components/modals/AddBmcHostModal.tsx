import * as React from 'react';
import { Modal, ModalBody, ModalHeader, ModalVariant } from '@patternfly/react-core';
import BMCForm from '../Agent/BMCForm';
import { AddBmcHostModalProps } from './types';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { EnvironmentErrors } from '../InfraEnv/EnvironmentErrors';
import ProvisioningConfigErrorAlert from './ProvisioningConfigErrorAlert';

const AddBmcHostModal: React.FC<AddBmcHostModalProps> = ({
  isOpen,
  onClose,
  infraEnv,
  onCreateBMH,
  usedHostnames,
  docVersion,
  provisioningConfigError,
}) => {
  const hasDHCP = infraEnv.metadata?.labels?.networkType !== 'static';
  const { t } = useTranslation();
  return (
    <Modal
      aria-label={t('ai:Add BMC host dialog')}
      isOpen={isOpen}
      onClose={onClose}
      variant={ModalVariant.medium}
      id="add-host-modal"
    >
      <ModalHeader title={t('ai:Add host using Baseboard Management Controller (BMC)')} />
      <ModalBody>
        <EnvironmentErrors infraEnv={infraEnv} docVersion={docVersion}>
          <ProvisioningConfigErrorAlert error={provisioningConfigError} />
          <BMCForm
            onCreateBMH={onCreateBMH}
            onClose={onClose}
            hasDHCP={hasDHCP}
            infraEnv={infraEnv}
            usedHostnames={usedHostnames}
          />
        </EnvironmentErrors>
      </ModalBody>
    </Modal>
  );
};

export default AddBmcHostModal;
