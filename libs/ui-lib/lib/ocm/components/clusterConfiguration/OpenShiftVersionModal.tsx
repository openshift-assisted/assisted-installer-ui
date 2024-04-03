import React from 'react';
import { Button, ButtonVariant, Modal, ModalVariant } from '@patternfly/react-core';
import './OpenshiftVersionModal.css';
import { OpenshiftSelectWithSearch } from '../../../common/components/ui/OpenshiftVersionSelect';
import { useOpenshiftVersions } from '../../hooks';
import { OpenshiftVersionOptionType } from '../../../common';

type OpenShiftVersionModalProps = {
  setOpenhiftVersionModalOpen: (isOpen: boolean) => void;
  isOpen: boolean;
  setValueSelected: (valueSelected: OpenshiftVersionOptionType) => void;
};

export const OpenShiftVersionModal = ({
  setOpenhiftVersionModalOpen,
  isOpen,
  setValueSelected,
}: OpenShiftVersionModalProps) => {
  const { versions } = useOpenshiftVersions(false);
  const onClose = React.useCallback(
    () => setOpenhiftVersionModalOpen(false),
    [setOpenhiftVersionModalOpen],
  );

  return (
    <Modal
      title="Available OpenShift Versions"
      id="available-openshift-versions-modal"
      isOpen={isOpen}
      actions={[
        <Button key="select" variant={ButtonVariant.primary} onClick={onClose}>
          Select
        </Button>,
        <Button key="close" variant={ButtonVariant.link} onClick={onClose}>
          Cancel
        </Button>,
      ]}
      onClose={onClose}
      variant={ModalVariant.small}
    >
      <OpenshiftSelectWithSearch versions={versions} setValueSelected={setValueSelected} />
    </Modal>
  );
};
