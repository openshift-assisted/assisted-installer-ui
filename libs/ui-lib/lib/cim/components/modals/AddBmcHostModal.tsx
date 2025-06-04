import * as React from 'react';
import {
	Modal,
	ModalVariant
} from '@patternfly/react-core/deprecated';
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
      title={t('ai:Add host using Baseboard Management Controller (BMC)')}
      isOpen={isOpen}
      onClose={onClose}
      variant={ModalVariant.medium}
      hasNoBodyWrapper
      id="add-host-modal"
    >
      <EnvironmentErrors infraEnv={infraEnv} docVersion={docVersion} inModal>
        <ProvisioningConfigErrorAlert error={provisioningConfigError} />
        <BMCForm
          onCreateBMH={onCreateBMH}
          onClose={onClose}
          hasDHCP={hasDHCP}
          infraEnv={infraEnv}
          usedHostnames={usedHostnames}
        />
      </EnvironmentErrors>
    </Modal>
  );
};

export default AddBmcHostModal;
