import * as React from 'react';
import {
	Modal,
	ModalVariant
} from '@patternfly/react-core/deprecated';
import BMCForm from '../Agent/BMCForm';
import { SecretK8sResource } from '../../types';
import { LoadingState } from '../../../common';
import { EditBMHModalProps } from './types';
import { AGENT_BMH_NAME_LABEL_KEY } from '../common/constants';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';

const EditBMHModal: React.FC<EditBMHModalProps> = ({
  isOpen,
  onClose,
  onEdit,
  infraEnv,
  bmh,
  nmStates,
  fetchSecret,
  usedHostnames,
}) => {
  const [secret, setSecret] = React.useState<SecretK8sResource>();
  const [isLoading, setLoading] = React.useState(true);
  const hasDHCP = infraEnv.metadata?.labels?.networkType !== 'static';

  const bmhName = bmh?.metadata?.name;
  const bmhNamespace = bmh?.metadata?.namespace;
  const bmhSecret = bmh?.spec?.bmc?.credentialsName;

  const nmState = nmStates.find(
    (nm) => nm.metadata?.labels?.[AGENT_BMH_NAME_LABEL_KEY] === bmhName,
  );
  const { t } = useTranslation();
  React.useEffect(() => {
    setSecret(undefined);
    const getResources = async () => {
      if (bmhSecret && bmhNamespace) {
        try {
          const secretResult = await fetchSecret(bmhNamespace, bmhSecret);
          setSecret(secretResult);
        } catch (err) {
          // console.error(t('ai:Could not get secret'), err);
        }
      }

      setLoading(false);
    };

    if (bmhNamespace && bmhName) {
      setLoading(true);
      void getResources();
    }
  }, [bmhName, bmhNamespace, fetchSecret, bmhSecret, hasDHCP, t]);
  return (
    <Modal
      aria-label={t('ai:Edit BMH dialog')}
      title={t('ai:Edit BMH')}
      isOpen={isOpen}
      onClose={onClose}
      variant={ModalVariant.small}
      hasNoBodyWrapper
      id="edit-bmh-modal"
    >
      {isLoading ? (
        <LoadingState />
      ) : (
        <BMCForm
          isEdit
          onCreateBMH={onEdit({ bmh, secret, nmState })}
          onClose={onClose}
          hasDHCP={hasDHCP}
          infraEnv={infraEnv}
          bmh={bmh}
          secret={secret}
          nmState={nmState}
          usedHostnames={usedHostnames}
        />
      )}
    </Modal>
  );
};

export default EditBMHModal;
