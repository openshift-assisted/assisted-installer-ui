import { TextInputTypes, FormSelectOptionProps } from '@patternfly/react-core';

export interface FieldProps {
  name: string;
  label?: string;
  helperText?: React.ReactNode;
  isRequired?: boolean;
  style?: React.CSSProperties;
  isReadOnly?: boolean;
  disableDeleteRow?: boolean;
  disableAddRow?: boolean;
  className?: string;
  isDisabled?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  innerRef?: React.Ref<any>;
}

export interface SelectFieldProps extends FieldProps {
  options: FormSelectOptionProps[];
  onChange?: (event: React.FormEvent<HTMLSelectElement>) => void;
  // onBlur?: (event: React.FormEvent<HTMLSelectElement>) => void;
}

export interface InputFieldProps extends FieldProps {
  type?: TextInputTypes;
  placeholder?: string;
  onChange?: (event: React.FormEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
}

export interface TextAreaProps extends FieldProps {
  placeholder?: string;
  onChange?: (event: React.FormEvent<HTMLTextAreaElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
}

export interface CheckboxFieldProps extends FieldProps {
  formLabel?: string;
  value?: string;
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
