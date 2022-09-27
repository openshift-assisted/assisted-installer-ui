import React from 'react';
import { Alert, AlertVariant, ButtonVariant, Form, FormGroup } from '@patternfly/react-core';
import { StaticIpView } from '../data/dataTypes';
import { getFieldId } from '../../../../../common';
import ConfirmationModal from '../../../../../common/components/ui/ConfirmationModal';
import { OcmRadio } from '../../../ui/OcmFormFields';

export type StaticIpViewRadioGroupProps = {
  initialView: StaticIpView;
  confirmOnChangeView: boolean;
  onChangeView(view: StaticIpView): void;
};

const StaticIpViewRadioGroup = ({
  initialView,
  confirmOnChangeView,
  onChangeView,
}: StaticIpViewRadioGroupProps) => {
  const GROUP_NAME = 'select-static-ip-view';
  const [confirmView, setConfirmView] = React.useState<StaticIpView>();
  const [view, setView] = React.useState<StaticIpView>(initialView);
  const handleChange = (_checked: boolean, event: React.FormEvent<HTMLInputElement>) => {
    const selectedView = event.currentTarget.value as StaticIpView;
    if (confirmOnChangeView) {
      setConfirmView(selectedView);
    } else {
      setView(selectedView);
      onChangeView(selectedView);
    }
  };

  const onConfirm = (selectedView: StaticIpView) => {
    setView(selectedView);
    setConfirmView(undefined);
    onChangeView(selectedView);
  };

  const onCancel = () => {
    setConfirmView(undefined);
  };

  const getCurrentViewText = () => {
    return view === StaticIpView.YAML ? 'YAML' : 'form';
  };

  const isFormViewSelected = view === StaticIpView.FORM;

  return (
    <>
      <Form isHorizontal>
        <FormGroup
          fieldId={getFieldId(GROUP_NAME, 'radio')}
          isInline
          label="Configure via :"
          className="static-config-type-label"
        >
          <OcmRadio
            label="Form view"
            name={GROUP_NAME}
            data-testid="select-form-view"
            id="select-form-view"
            value={StaticIpView.FORM}
            isChecked={isFormViewSelected}
            onChange={handleChange}
          />
          <OcmRadio
            label="YAML view"
            name={GROUP_NAME}
            data-testid="select-yaml-view"
            id="select-yaml-view"
            value={StaticIpView.YAML}
            isChecked={!isFormViewSelected}
            onChange={handleChange}
          />
        </FormGroup>
      </Form>
      {isFormViewSelected && (
        <Alert
          variant={AlertVariant.info}
          isInline
          title={
            'Form view supports basic configurations. Select YAML view for advanced configurations.'
          }
        />
      )}
      {confirmView && (
        <ConfirmationModal
          title={'Change configuration option?'}
          titleIconVariant={'warning'}
          confirmationButtonText={'Change'}
          confirmationButtonVariant={ButtonVariant.primary}
          content={
            <>
              <p>{`All data and configuration done in ${getCurrentViewText()} view will be lost.`}</p>
            </>
          }
          onClose={onCancel}
          onConfirm={() => onConfirm(confirmView)}
        />
      )}
    </>
  );
};

export default StaticIpViewRadioGroup;
