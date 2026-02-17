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
  onClose: VoidFunction;
  getHelperText?: HelperTextType;
};

export const OpenShiftVersionModal = ({
  allVersions,
  onClose,
  getHelperText,
}: OpenShiftVersionModalProps) => {
  const { values, setFieldValue } = useFormikContext<ClusterDetailsValues>();

  return (
    <Modal
      id="available-openshift-versions-modal"
      isOpen
      onClose={onClose}
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
          onClick={() => {
            if (values.customOpenshiftSelect !== null) {
              setFieldValue('openshiftVersion', values.customOpenshiftSelect);
            }
            onClose();
          }}
        >
          Select
        </Button>
        <Button key="close-custom-ocp" variant={ButtonVariant.link} onClick={onClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};
