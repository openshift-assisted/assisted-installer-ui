import * as React from 'react';
import { Modal, ModalVariant } from '@patternfly/react-core';
import { BMCFormProps } from '../Agent/types';
import { BMCForm } from '../Agent';
import { NMStateK8sResource, SecretK8sResource } from '../../types';
import { LoadingState } from '../../../common';

type EditBMHModalProps = Pick<BMCFormProps, 'onClose' | 'infraEnv' | 'bmh'> & {
  isOpen: boolean;
  onEdit: BMCFormProps['onCreate'];
  fetchNMState: (namespace: string, name: string) => Promise<NMStateK8sResource>;
  fetchSecret: (namespace: string, bmhName: string) => Promise<SecretK8sResource>;
};

const EditBMHModal: React.FC<EditBMHModalProps> = ({
  isOpen,
  onClose,
  onEdit,
  infraEnv,
  bmh,
  fetchNMState,
  fetchSecret,
}) => {
  const [nmState, setNMState] = React.useState<NMStateK8sResource>();
  const [secret, setSecret] = React.useState<SecretK8sResource>();
  const [isLoading, setLoading] = React.useState(false);
  const hasDHCP = infraEnv.metadata?.labels?.networkType !== 'static';

  const bmhName = bmh?.metadata?.name;
  const bmhNamespace = bmh?.metadata?.namespace;
  const bmhSecret = bmh?.spec?.bmc?.credentialsName;

  React.useEffect(() => {
    setNMState(undefined);
    setSecret(undefined);
    const getResources = async () => {
      if (bmhName && bmhNamespace) {
        try {
          const nmStateResult = await fetchNMState(bmhNamespace, bmhName);
          setNMState(nmStateResult);
        } catch (err) {
          console.error('Could not get nm state', err);
        }
      }
      if (bmhSecret && bmhNamespace) {
        try {
          const secretResult = await fetchSecret(bmhNamespace, bmhSecret);
          setSecret(secretResult);
        } catch (err) {
          console.error('Could not get secret', err);
        }
      }

      setLoading(false);
    };

    if (bmhNamespace && bmhName) {
      setLoading(true);
      getResources();
    }
  }, [bmhName, bmhNamespace, fetchNMState, fetchSecret, bmhSecret]);
  return (
    <Modal
      aria-label="Edit BMH dialog"
      title="Edit BMH"
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
          onCreate={onEdit}
          onClose={onClose}
          hasDHCP={hasDHCP}
          infraEnv={infraEnv}
          bmh={bmh}
          secret={secret}
          nmState={nmState}
        />
      )}
    </Modal>
  );
};

export default EditBMHModal;
