import React from 'react';
import { HelperText, FormGroup } from '@patternfly/react-core';
import { DropdownItem, DropdownToggle, Dropdown } from '@patternfly/react-core/deprecated';
import { CaretDownIcon } from '@patternfly/react-icons/dist/js/icons/caret-down-icon';
import { useField } from 'formik';
import { getFieldId } from '../../../../../common/components/ui/formik';
import { PopoverIcon } from '../../../../../common';

const FolderLabel = () => {
  return (
    <>
      Folder{' '}
      <PopoverIcon
        bodyContent={
          <>
            To overwrite an existing manifest, save the new manifest in the same folder with the
            same name.
          </>
        }
      />
    </>
  );
};

type FolderDropdownProps = {
  name: string;
};

const dropdownItems = [
  <DropdownItem key="manifests" id="manifests">
    {'manifests'}
  </DropdownItem>,
  <DropdownItem key="openshift" id="openshift">
    {'openshift'}
  </DropdownItem>,
];

export const FolderDropdown = ({ name }: FolderDropdownProps) => {
  const [field, { value }, { setValue }] = useField<string>(name);
  const [isOpen, setOpen] = React.useState(false);
  const fieldId = getFieldId(name, 'input');

  const onSelect = React.useCallback(
    (event?: React.SyntheticEvent<HTMLDivElement>) => {
      setValue(event?.currentTarget.id as string);
      setOpen(false);
    },
    [setOpen, setValue],
  );

  const toggle = React.useMemo(
    () => (
      <DropdownToggle
        onToggle={(_event, val) => setOpen(val)}
        toggleIndicator={CaretDownIcon}
        isText
        className="pf-v5-u-w-100"
      >
        {value || 'manifests'}
      </DropdownToggle>
    ),
    [setOpen, value],
  );

  return (
    <FormGroup fieldId={fieldId} label={<FolderLabel />} isRequired>
      <Dropdown
        {...field}
        name={name}
        id={fieldId}
        onSelect={onSelect}
        dropdownItems={dropdownItems}
        toggle={toggle}
        isOpen={isOpen}
        className="pf-v5-u-w-100"
      />
      <HelperText style={{ display: 'inherit' }}>
        {'Manifests can be placed in "manifests" or "openshift" directories.'}
      </HelperText>
    </FormGroup>
  );
};
