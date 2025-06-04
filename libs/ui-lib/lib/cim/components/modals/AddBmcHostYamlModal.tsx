import * as React from 'react';
import {
	Modal,
	ModalVariant
} from '@patternfly/react-core/deprecated';
import { UploadActionModalProps } from './types';
import AddBmcHostYamlForm from './AddBmcHostYamlForm';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { EnvironmentErrors } from '../InfraEnv/EnvironmentErrors';
import ProvisioningConfigErrorAlert from './ProvisioningConfigErrorAlert';

const AddBmcHostYamlModal: React.FC<UploadActionModalProps> = ({
  isOpen,
  onClose,
  onCreateBmcByYaml,
  infraEnv,
  docVersion,
  provisioningConfigError,
}) => {
  const { t } = useTranslation();
  return (
    <Modal
      aria-label={t('ai:Add host dialog')}
      title={t('ai:Add hosts by uploading YAML (BMC)')}
      variant={ModalVariant.medium}
      isOpen={isOpen}
      onClose={onClose}
      hasNoBodyWrapper
    >
      <EnvironmentErrors infraEnv={infraEnv} docVersion={docVersion} inModal>
        <ProvisioningConfigErrorAlert error={provisioningConfigError} />
        <AddBmcHostYamlForm onClose={onClose} onCreateBmcByYaml={onCreateBmcByYaml} />
      </EnvironmentErrors>
    </Modal>
  );
};

export default AddBmcHostYamlModal;
