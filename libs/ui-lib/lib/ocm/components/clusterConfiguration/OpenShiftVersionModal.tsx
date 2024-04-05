import React from 'react';
import { Button, ButtonVariant, FormGroup, Modal, ModalVariant } from '@patternfly/react-core';
import './OpenshiftVersionModal.css';
import { OpenshiftSelectWithSearch } from '../../../common/components/ui/OpenshiftSelectWithSearch';
import { useOpenshiftVersions } from '../../hooks';
import { HelperTextType } from '../../../common/components/ui/OpenShiftVersionDropdown';

type OpenShiftVersionModalProps = {
  setOpenshiftVersionModalOpen: (isOpen: boolean) => void;
  isOpen: boolean;
  getHelperText: HelperTextType;
};

export const OpenShiftVersionModal = ({
  setOpenshiftVersionModalOpen,
  isOpen,
  getHelperText,
}: OpenShiftVersionModalProps) => {
  const { versions } = useOpenshiftVersions(false);
  const onClose = () => setOpenshiftVersionModalOpen(false);

  return (
    <Modal
      title="Available OpenShift Versions"
      id="available-openshift-versions-modal"
      isOpen={isOpen}
      actions={[
        <Button key="select-custom-ocp" variant={ButtonVariant.primary} onClick={onClose}>
          Select
        </Button>,
        <Button key="close-custom-ocp" variant={ButtonVariant.link} onClick={onClose}>
          Cancel
        </Button>,
      ]}
      onClose={onClose}
      variant={ModalVariant.small}
    >
      <FormGroup
        id={`form-control__customOpenshiftSelect`}
        fieldId={'customOpenshiftSelect'}
        label={'OpenShift version'}
        isRequired
      >
        <OpenshiftSelectWithSearch versions={versions} getHelperText={getHelperText} />
      </FormGroup>
    </Modal>
  );
};
