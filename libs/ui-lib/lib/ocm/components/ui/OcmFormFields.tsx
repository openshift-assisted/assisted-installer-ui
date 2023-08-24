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
  SwitchField,
} from '../../../common';
import {
  CheckboxFieldProps,
  CodeFieldProps,
  RadioFieldProps,
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
type OcmInputFieldProps = Parameters<typeof OcmInputField>[0];
const OcmCheckboxField = FormFieldDisabler<CheckboxFieldProps>(CheckboxField);
type OcmCheckboxFieldProps = Parameters<typeof OcmCheckboxField>[0];
const OcmSwitchField = FormFieldDisabler<SwitchFieldProps>(SwitchField);
type OcmSwitchFieldProps = Parameters<typeof OcmSwitchField>[0];
const OcmRadioField = FormFieldDisabler<RadioFieldProps>(RadioField);
type OcmRadioFieldProps = Parameters<typeof OcmRadioField>[0];
const OcmCodeField = FormFieldDisabler<CodeFieldProps>(CodeField);
type OcmCodeFieldProps = Parameters<typeof OcmCodeField>[0];

// Patternfly components
const OcmCheckbox = FormFieldDisabler<CheckboxProps>(Checkbox);
type OcmCheckboxProps = Parameters<typeof OcmCheckbox>[0];
const OcmRadio = FormFieldDisabler<RadioProps>(Radio);
type OcmRadioProps = Parameters<typeof OcmRadio>[0];

// With forwardRef
const OcmRichInputField = RefFormFieldDisabler<RichInputFieldPropsProps>(RichInputField);
type OcmRichInputFieldProps = Parameters<typeof OcmRichInputField>[0];

export {
  OcmInputField,
  OcmInputFieldProps,
  OcmRichInputField,
  OcmRichInputFieldProps,
  OcmCheckbox,
  OcmCheckboxProps,
  OcmCheckboxField,
  OcmCheckboxFieldProps,
  OcmCodeField,
  OcmCodeFieldProps,
  OcmSwitchField,
  OcmSwitchFieldProps,
  OcmRadioField,
  OcmRadioFieldProps,
  OcmRadio,
  OcmRadioProps,
};
