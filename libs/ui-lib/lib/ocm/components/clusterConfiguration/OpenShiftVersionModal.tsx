import React from 'react';
import {
  Button,
  ButtonVariant,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Modal,
  ModalVariant,
} from '@patternfly/react-core';
import './OpenshiftVersionModal.css';
import { OpenshiftSelectWithSearch } from '../../../common/components/ui/OpenshiftVersionSelect';
import { useOpenshiftVersions } from '../../hooks';
import { OpenshiftVersionOptionType } from '../../../common';

type OpenShiftVersionModalProps = {
  setOpenshiftVersionModalOpen: (isOpen: boolean) => void;
  isOpen: boolean;
  setValueSelected: (valueSelected: OpenshiftVersionOptionType) => void;
  getHelperText: HelperTextType;
};

export const OpenShiftVersionModal = ({
  setOpenshiftVersionModalOpen,
  isOpen,
  setValueSelected,
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
      <FormGroup
        id={`form-control__typeahead-openshift-select`}
        fieldId={'typeahead-openshift-select'}
        label={'OpenShift version'}
        isRequired
      >
        <OpenshiftSelectWithSearch
          versions={versions}
          setValueSelected={setValueSelected}
          getHelperText={getHelperText}
        />
      </FormGroup>
    </Modal>
  );
};
