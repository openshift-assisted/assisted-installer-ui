import React from 'react';
import {
  HelperText,
  FormGroup,
  Dropdown,
  DropdownItem,
  MenuToggle,
  MenuToggleElement,
} from '@patternfly/react-core';
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

  const onSelect = (event?: React.MouseEvent<Element, MouseEvent>): void => {
    setValue(event?.currentTarget.id as string);
    setOpen(false);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={() => setOpen(!isOpen)}
      isExpanded={isOpen}
      className="pf-v5-u-w-100"
    >
      {value || 'manifests'}
    </MenuToggle>
  );

  return (
    <FormGroup fieldId={fieldId} label={<FolderLabel />} isRequired>
      <Dropdown
        {...field}
        id={fieldId}
        onOpenChange={() => setOpen(!isOpen)}
        onSelect={onSelect}
        toggle={toggle}
        isOpen={isOpen}
      >
        {dropdownItems}
      </Dropdown>
      <HelperText style={{ display: 'inherit' }}>
        {'Manifests can be placed in "manifests" or "openshift" directories.'}
      </HelperText>
    </FormGroup>
  );
};
