import React, { useState } from 'react';
import {
	Button,
	ButtonVariant,
	FormGroup
} from '@patternfly/react-core';
import {
	Modal,
	ModalVariant
} from '@patternfly/react-core/deprecated';
import { OpenShiftSelectWithSearch } from './OpenShiftSelectWithSearch';
import { HelperTextType } from './OpenShiftVersionDropdown';
import { useFormikContext } from 'formik';
import { ClusterDetailsValues, OpenshiftVersionOptionType } from '../..';
import './OpenShiftVersionModal.css';

type OpenShiftVersionModalProps = {
  allVersions: OpenshiftVersionOptionType[];
  setOpenshiftVersionModalOpen: (isOpen: boolean) => void;
  getHelperText?: HelperTextType;
};

export const OpenShiftVersionModal = ({
  allVersions,
  setOpenshiftVersionModalOpen,
  getHelperText,
}: OpenShiftVersionModalProps) => {
  const { setFieldValue } = useFormikContext<ClusterDetailsValues>();
  const onClose = () => setOpenshiftVersionModalOpen(false);
  const [customOpenshiftSelect, setCustomOpenshiftSelect] = useState<OpenshiftVersionOptionType>(); // Cambiar el tipo según lo que esperes aquí

  const handleSelect = () => {
    if (customOpenshiftSelect) {
      setFieldValue('customOpenshiftSelect', customOpenshiftSelect);
    }
    onClose();
  };

  return (
    <Modal
      title="Available OpenShift Versions"
      id="available-openshift-versions-modal"
      isOpen
      actions={[
        <Button key="select-custom-ocp" variant={ButtonVariant.primary} onClick={handleSelect}>
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
        <OpenShiftSelectWithSearch
          versions={allVersions}
          getHelperText={getHelperText}
          setCustomOpenshiftSelect={setCustomOpenshiftSelect}
        />
      </FormGroup>
    </Modal>
  );
};
