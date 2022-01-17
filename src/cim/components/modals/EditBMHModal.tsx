import * as React from 'react';
import { Modal, ModalVariant } from '@patternfly/react-core';
import { BMCForm } from '../Agent';
import { NMStateK8sResource, SecretK8sResource } from '../../types';
import { LoadingState } from '../../../common';
import { EditBMHModalProps } from './types';

const EditBMHModal: React.FC<EditBMHModalProps> = ({
  isOpen,
  onClose,
  onEdit,
  infraEnv,
  bmh,
  fetchNMState,
  fetchSecret,
  usedHostnames,
}) => {
  const [nmState, setNMState] = React.useState<NMStateK8sResource>();
  const [secret, setSecret] = React.useState<SecretK8sResource>();
  const [isLoading, setLoading] = React.useState(true);
  const hasDHCP = infraEnv.metadata?.labels?.networkType !== 'static';

  const bmhName = bmh?.metadata?.name;
  const bmhNamespace = bmh?.metadata?.namespace;
  const bmhSecret = bmh?.spec?.bmc?.credentialsName;

  React.useEffect(() => {
    setNMState(undefined);
    setSecret(undefined);
    const getResources = async () => {
      if (bmhName && bmhNamespace && !hasDHCP) {
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
  }, [bmhName, bmhNamespace, fetchNMState, fetchSecret, bmhSecret, hasDHCP]);
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
