import * as React from 'react';
import { useSelector } from 'react-redux';
import { Checkbox } from '@patternfly/react-core';
import { CheckboxProps } from '@patternfly/react-core/src/components/Checkbox/Checkbox';
import { selectCurrentClusterPermissionsState } from '../../selectors';
import {
  CheckboxField,
  InputField,
  RadioField,
  RichInputField,
  SelectField,
  SwitchField,
} from '../../../common';
import {
  CheckboxFieldProps,
  InputFieldProps,
  RadioFieldProps,
  SelectFieldProps,
  SwitchFieldProps,
} from '../../../common/components/ui/formik/types';
import { RichInputFieldPropsProps } from '../../../common/components/ui/formik/RichInputField';

type DisableableField = {
  isDisabled?: boolean;
};

function FormFieldDisabler<T extends DisableableField>(
  FormComponent: (props: T) => JSX.Element | null,
) {
  return function WrapperHoc(props: T) {
    const { isViewerMode } = useSelector(selectCurrentClusterPermissionsState);

    const isDisabled = props.isDisabled || isViewerMode;
    return <FormComponent {...props} isDisabled={isDisabled} />;
  };
}

export function RefFormFieldDisabler<T extends DisableableField>(
  FormComponent: (props: T) => JSX.Element | null,
) {
  return React.forwardRef(function useInputRef(props: T, ref) {
    const { isViewerMode } = useSelector(selectCurrentClusterPermissionsState);

    const isDisabled: boolean = props.isDisabled || isViewerMode;
    return <FormComponent ref={ref} {...props} isDisabled={isDisabled} />;
  });
}

const OcmInputField = FormFieldDisabler<InputFieldProps>(InputField);
const OcmSelectField = FormFieldDisabler<SelectFieldProps>(SelectField);
const OcmCheckboxField = FormFieldDisabler<CheckboxFieldProps>(CheckboxField);
const OcmSwitchField = FormFieldDisabler<SwitchFieldProps>(SwitchField);
const OcmRadioField = FormFieldDisabler<RadioFieldProps>(RadioField);

// TODO Try to fix the linting error
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const OcmCheckbox = FormFieldDisabler<CheckboxProps>(Checkbox);

// With forwardRef
const OcmRichInputField = RefFormFieldDisabler<RichInputFieldPropsProps>(RichInputField);

export {
  OcmInputField,
  OcmRichInputField,
  OcmSelectField,
  OcmCheckbox,
  OcmCheckboxField,
  OcmSwitchField,
  OcmRadioField,
};
