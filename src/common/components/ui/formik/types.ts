import * as React from 'react';
import {
  TextInputTypes,
  FormSelectOptionProps,
  SelectOptionProps,
  TooltipProps,
} from '@patternfly/react-core';
import { FieldValidator, FieldHelperProps } from 'formik';
import { DropzoneProps, DropFileEventHandler } from 'react-dropzone';
import { CodeEditorProps } from '@patternfly/react-code-editor';

export interface FieldProps {
  name: string;
  label?: React.ReactNode;
  labelIcon?: React.ReactElement;
  helperText?: React.ReactNode;
  isRequired?: boolean;
  style?: React.CSSProperties;
  isReadOnly?: boolean;
  disableDeleteRow?: boolean;
  disableAddRow?: boolean;
  className?: string;
  groupClassName?: string;
  isDisabled?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ref?: React.Ref<any>;
  validate?: FieldValidator;
  min?: number;
  max?: number;
  idPostfix?: string;
}

export interface SelectFieldProps extends FieldProps {
  options: FormSelectOptionProps[];
  onChange?: (event: React.FormEvent<HTMLSelectElement>) => void;
  getHelperText?: (value: string) => React.ReactNode | undefined;
  // onBlur?: (event: React.FormEvent<HTMLSelectElement>) => void;
}

export type MultiSelectOption = SelectOptionProps & { id: string; displayName: string };

export interface MultiSelectFieldProps extends FieldProps {
  options: MultiSelectOption[];
  placeholderText?: string;
  onChange?: (val: string[]) => void;
  getHelperText?: (value: string) => React.ReactNode | undefined;
  tooltipProps?: TooltipProps;
}

export interface SwitchFieldProps extends FieldProps {
  // replace the default onChange handler
  onChangeCustomOverride?: (checked: boolean, event: React.FormEvent<HTMLInputElement>) => void;
  // called in addition to the default internal onChange handler
  onChange?: (checked: boolean, event: React.FormEvent<HTMLInputElement>) => void;
  getHelperText?: (value: string) => string | undefined;
  tooltipProps?: TooltipProps;
}

export interface InputFieldProps extends FieldProps {
  type?: TextInputTypes;
  placeholder?: string;
  noDefaultOnChange?: boolean;
  onChange?: (event: React.FormEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  validate?: FieldValidator;
}

export interface NumberInputFieldProps extends FieldProps {
  minValue?: number;
  maxValue?: number;
  minusBtnAriaLabel?: string;
  plusBtnAriaLabel?: string;
  unit?: string;
  formatValue?: (newValue: number) => number;
  onChange?: (event: React.FormEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  validate?: FieldValidator;
}

export interface TextAreaFieldProps extends FieldProps {
  getErrorText?: (error: string) => React.ReactNode | undefined;
  placeholder?: string;
  onChange?: (event: React.FormEvent<HTMLTextAreaElement>) => void;
  onBlur?: (event: React.FormEvent<HTMLTextAreaElement>) => void;
  spellCheck?: boolean;
  rows?: number;
}

export interface UploadFieldProps extends FieldProps {
  getErrorText?: (error: string) => React.ReactNode | undefined;
  placeholder?: string;
  onChange?: (event: React.FormEvent<HTMLTextAreaElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLDivElement>) => void;
  allowEdittingUploadedText?: boolean;
  dropzoneProps?: Omit<DropzoneProps, 'onDropRejected'> & {
    onDropRejected?: (helpers: FieldHelperProps<string>) => DropFileEventHandler;
  };
  transformValue?: (key: string) => void;
}

export interface TextAreaSecretProps extends TextAreaFieldProps {
  isSet?: boolean;
  isEdit: boolean;
  helperTextHidden?: string;
  onToggle: (isHidden: boolean) => void;
}

export interface CheckboxFieldProps extends FieldProps {
  onChange?: (value: boolean, event: React.FormEvent<HTMLInputElement>) => void;
}

export interface SearchInputFieldProps extends InputFieldProps {
  onSearch: (searchTerm: string) => void;
}

export interface DropdownFieldProps extends FieldProps {
  items?: object;
  selectedKey?: string;
  title?: React.ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
  onChange?: (value: string) => void;
}

export interface CodeFieldProps extends FieldProps {
  language: CodeEditorProps['language'];
  description?: React.ReactNode;
}
