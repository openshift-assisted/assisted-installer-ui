import React from 'react';
import { ButtonVariant, Form, FormGroup, Radio } from '@patternfly/react-core';
import { getFieldId } from '../../../../../common';
import { StaticIpView } from '../data/dataTypes';
import ConfirmationModal from '../../../../../common/components/ui/ConfirmationModal';

export type StaticIpViewRadioGroupProps = {
  initialView: StaticIpView;
  confirmOnChangeView: boolean;
  onChangeView(view: StaticIpView): void;
};

const StaticIpViewRadioGroup: React.FC<StaticIpViewRadioGroupProps> = ({
  initialView,
  confirmOnChangeView,
  onChangeView,
}) => {
  const GROUP_NAME = 'select-static-ip-view';
  const [confirmView, setConfirmView] = React.useState<StaticIpView>();
  const [view, setView] = React.useState<StaticIpView>(initialView);
  const handleChange = (checked: boolean, event: React.FormEvent<HTMLInputElement>) => {
    const selectedView = event.currentTarget.value as StaticIpView;
    if (confirmOnChangeView) {
      setConfirmView(selectedView);
    } else {
      setView(selectedView);
      onChangeView(selectedView);
    }
  };

  const onConfirm = async (selectedView: StaticIpView) => {
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

  return (
    <>
      <Form isHorizontal>
        <FormGroup
          fieldId={getFieldId(GROUP_NAME, 'radio')}
          isInline
          label="Configure via :"
          className="static-config-type-label"
        >
          <Radio
            label="Form view"
            name={GROUP_NAME}
            data-testid="select-form-view"
            id="select-form-view"
            value={StaticIpView.FORM}
            isChecked={view === StaticIpView.FORM}
            onChange={handleChange}
          />
          <Radio
            label="YAML view"
            name={GROUP_NAME}
            data-testid="select-yaml-view"
            id="select-yaml-view"
            value={StaticIpView.YAML}
            onChange={handleChange}
            isChecked={view === StaticIpView.YAML}
          />
        </FormGroup>
      </Form>
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
