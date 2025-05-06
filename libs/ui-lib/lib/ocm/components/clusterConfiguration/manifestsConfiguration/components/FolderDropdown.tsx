import React from 'react';
import { HelperText, FormGroup } from '@patternfly/react-core';
import { Dropdown, DropdownItem, MenuToggle } from '@patternfly/react-core';
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
  <DropdownItem key="manifests" value="manifests">
    {'manifests'}
  </DropdownItem>,
  <DropdownItem key="openshift" value="openshift">
    {'openshift'}
  </DropdownItem>,
];

export const FolderDropdown = ({ name }: FolderDropdownProps) => {
  const [field, { value }, { setValue }] = useField<string>(name);
  const [isOpen, setOpen] = React.useState(false);
  const fieldId = getFieldId(name, 'input');

  const onSelect = (
    event: React.MouseEvent | React.KeyboardEvent | undefined,
    value: string | number | undefined,
  ) => {
    setValue((value as string) || 'manifests'); // Default to 'manifests' if undefined
    setOpen(false);
  };

  const toggle = React.useMemo(
    () => (toggleRef: React.RefObject<any>) =>
      (
        <MenuToggle
          onClick={() => setOpen(!isOpen)}
          ref={toggleRef}
          className="pf-v5-u-w-100"
          isExpanded={isOpen}
        >
          {value || 'manifests'}
        </MenuToggle>
      ),
    [value, isOpen],
  );

  return (
    <FormGroup fieldId={fieldId} label={<FolderLabel />} isRequired>
      <Dropdown onSelect={onSelect} toggle={toggle} isOpen={isOpen} className="pf-v5-u-w-100">
        {dropdownItems}
      </Dropdown>
      <HelperText style={{ display: 'inherit' }}>
        {'Manifests can be placed in "manifests" or "openshift" directories.'}
      </HelperText>
    </FormGroup>
  );
};
