import * as React from 'react';
import { useSelector } from 'react-redux';
import { Checkbox } from '@patternfly/react-core';
import { selectCurrentClusterPermissionsState } from '../../selectors';
import {
  CheckboxField,
  InputField,
  RadioField,
  RichInputField,
  SelectField,
  SwitchField,
  TextAreaField,
} from '../../../common';

// TODO set the proper type that already has isDisabled
interface InputType extends Record<string, unknown> {
  isDisabled?: boolean;
}

// TODO fix TS
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
function InputFieldDisabler<T extends InputType>(InputComponent) {
  return function WrapperHoc(props: T) {
    const { isViewerMode } = useSelector(selectCurrentClusterPermissionsState);

    const isDisabled = props.isDisabled || isViewerMode;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return <InputComponent {...props} isDisabled={isDisabled} />;
  };
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export function InputRefFieldDisabler<T extends InputType>(InputComponent) {
  return React.forwardRef(function useInputRef(props: T, ref) {
    const { isViewerMode } = useSelector(selectCurrentClusterPermissionsState);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const isDisabled: boolean = props.isDisabled || isViewerMode;

    return <InputComponent ref={ref} {...props} isDisabled={isDisabled} />;
  });
}

const OCMInputField = InputFieldDisabler(InputField);
const OCMRichInputField = InputRefFieldDisabler(RichInputField);
const OCMSelectField = InputFieldDisabler(SelectField);
const OCMCheckboxField = InputFieldDisabler(CheckboxField);
const OCMCheckbox = InputFieldDisabler(Checkbox);
const OCMSwitchField = InputFieldDisabler(SwitchField);
const OCMRadioField = InputFieldDisabler(RadioField);
const OCMTextAreaField = InputFieldDisabler(TextAreaField);

export {
  InputFieldDisabler,
  OCMInputField,
  OCMRichInputField,
  OCMSelectField,
  OCMCheckbox,
  OCMCheckboxField,
  OCMSwitchField,
  OCMRadioField,
  OCMTextAreaField,
};
