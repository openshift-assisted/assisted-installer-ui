import * as React from 'react';
import { useSelector } from 'react-redux';
import { Checkbox, CheckboxProps, Radio, RadioProps } from '@patternfly/react-core';
import { selectCurrentClusterPermissionsState } from '../../selectors';
import {
  CheckboxField,
  CodeField,
  InputField,
  RadioField,
  RichInputField,
  SelectField,
  SwitchField,
} from '../../../common';
import {
  CheckboxFieldProps,
  CodeFieldProps,
  RadioFieldProps,
  SelectFieldProps,
  SwitchFieldProps,
} from '../../../common/components/ui/formik/types';
import { RichInputFieldPropsProps } from '../../../common/components/ui/formik/RichInputField';

type DisableableField = {
  isDisabled?: boolean;
};

function FormFieldDisabler<T extends DisableableField>(FormComponent: React.ComponentType<T>) {
  return function WrapperHoc(props: T) {
    const { isViewerMode } = useSelector(selectCurrentClusterPermissionsState);

    const isDisabled = props.isDisabled || isViewerMode;
    return <FormComponent {...props} isDisabled={isDisabled} />;
  };
}

export function RefFormFieldDisabler<T extends DisableableField>(
  FormComponent: React.ComponentType<T>,
) {
  return React.forwardRef(function useInputRef(props: T, ref) {
    const { isViewerMode } = useSelector(selectCurrentClusterPermissionsState);

    const isDisabled: boolean = props.isDisabled || isViewerMode;
    return <FormComponent ref={ref} {...props} isDisabled={isDisabled} />;
  });
}

// Formik Fields
const OcmInputField = FormFieldDisabler<React.ComponentProps<typeof InputField>>(InputField);
const OcmSelectField = FormFieldDisabler<SelectFieldProps>(SelectField);
const OcmCheckboxField = FormFieldDisabler<CheckboxFieldProps>(CheckboxField);
const OcmSwitchField = FormFieldDisabler<SwitchFieldProps>(SwitchField);
const OcmRadioField = FormFieldDisabler<RadioFieldProps>(RadioField);
const OcmCodeField = FormFieldDisabler<CodeFieldProps>(CodeField);

// Patternfly components
const OcmCheckbox = FormFieldDisabler<CheckboxProps>(Checkbox);
const OcmRadio = FormFieldDisabler<RadioProps>(Radio);

// With forwardRef
const OcmRichInputField = RefFormFieldDisabler<RichInputFieldPropsProps>(RichInputField);

export {
  OcmInputField,
  OcmRichInputField,
  OcmSelectField,
  OcmCheckbox,
  OcmCheckboxField,
  OcmCodeField,
  OcmSwitchField,
  OcmRadioField,
  OcmRadio,
};
