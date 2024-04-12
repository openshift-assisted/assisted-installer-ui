import React, { useState } from 'react';
import { Button, ButtonVariant, FormGroup, Modal, ModalVariant } from '@patternfly/react-core';
import './OpenshiftVersionModal.css';
import { OpenshiftSelectWithSearch } from '../../../common/components/ui/OpenshiftSelectWithSearch';
import { useOpenshiftVersions } from '../../hooks';
import { HelperTextType } from '../../../common/components/ui/OpenShiftVersionDropdown';
import { useFormikContext } from 'formik';
import { ClusterDetailsValues, OpenshiftVersionOptionType } from '../../../common';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';

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
  const { setFieldValue } = useFormikContext<ClusterDetailsValues>();
  const { versions } = useOpenshiftVersions(false);
  const onClose = () => setOpenshiftVersionModalOpen(false);
  const [customOpenshiftSelect, setCustomOpenshiftSelect] = useState<OpenshiftVersionOptionType>(); // Cambiar el tipo según lo que esperes aquí
  const { t } = useTranslation();

  const handleSelect = () => {
    if (customOpenshiftSelect) {
      setFieldValue('customOpenshiftSelect', customOpenshiftSelect);
      setFieldValue('helperTextOpenshift', getHelperText(versions, customOpenshiftSelect.value, t));
    }
    onClose();
  };

  return (
    <Modal
      title="Available OpenShift Versions"
      id="available-openshift-versions-modal"
      isOpen={isOpen}
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
        <OpenshiftSelectWithSearch
          versions={versions}
          getHelperText={getHelperText}
          setCustomOpenshiftSelect={setCustomOpenshiftSelect}
        />
      </FormGroup>
    </Modal>
  );
};
