import React from 'react';
import {
  Button,
  ButtonVariant,
  FormGroup,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
} from '@patternfly/react-core';
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

  const onCancel = () => {
    setFieldValue('customOpenshiftSelect', null);
    setOpenshiftVersionModalOpen(false);
  };

  return (
    <Modal
      id="available-openshift-versions-modal"
      isOpen
      onClose={() => setOpenshiftVersionModalOpen(false)}
      variant={ModalVariant.small}
    >
      <ModalHeader title="Available OpenShift Versions" />
      <ModalBody>
        <FormGroup
          id={`form-control__customOpenshiftSelect`}
          fieldId={'customOpenshiftSelect'}
          label={'OpenShift version'}
          isRequired
        >
          <OpenShiftSelectWithSearch versions={allVersions} getHelperText={getHelperText} />
        </FormGroup>
      </ModalBody>
      <ModalFooter>
        <Button
          key="select-custom-ocp"
          variant={ButtonVariant.primary}
          onClick={() => setOpenshiftVersionModalOpen(false)}
        >
          Select
        </Button>
        <Button key="close-custom-ocp" variant={ButtonVariant.link} onClick={onCancel}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};
