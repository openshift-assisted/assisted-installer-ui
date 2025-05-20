import * as React from 'react';
import { Modal, ModalVariant } from '@patternfly/react-core';
import BMCForm from '../Agent/BMCForm';
import {
  AgentK8sResource,
  BareMetalHostK8sResource,
  NMStateK8sResource,
  SecretK8sResource,
} from '../../types';
import { LoadingState } from '../../../common';
import { AGENT_BMH_NAME_LABEL_KEY } from '../common/constants';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { k8sGet } from '@openshift-console/dynamic-plugin-sdk';
import { SecretModel } from '../../types/models';
import { BMCFormProps } from '../Agent';
import { getAgentsHostsNames } from '../ClusterDeployment/helpers';

export type EditBMHModalProps = Pick<BMCFormProps, 'onClose' | 'infraEnv' | 'bmh'> & {
  nmStates: NMStateK8sResource[];
  agents: AgentK8sResource[];
  bmhs: BareMetalHostK8sResource[];
};

const EditBMHModal: React.FC<EditBMHModalProps> = ({
  onClose,
  infraEnv,
  bmh,
  nmStates,
  agents,
  bmhs,
}) => {
  const usedHostnames = getAgentsHostsNames(agents, bmhs);
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
          const secretResult = await k8sGet({
            model: SecretModel,
            name: bmhSecret,
            ns: bmhNamespace,
          });
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
  }, [bmhName, bmhNamespace, bmhSecret, hasDHCP, t]);
  return (
    <Modal
      aria-label={t('ai:Edit BMH dialog')}
      title={t('ai:Edit BMH')}
      isOpen
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
