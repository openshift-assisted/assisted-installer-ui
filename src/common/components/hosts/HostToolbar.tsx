import * as React from 'react';
import {
  ActionList,
  ActionListItem,
  Dropdown,
  DropdownItem,
  DropdownToggle,
  DropdownToggleCheckbox,
} from '@patternfly/react-core';
import { CaretDownIcon } from '@patternfly/react-icons';

export const ActionItemsContext = React.createContext(false);

type HostToolbarProps = {
  hostIDs: string[];
  selectedHostIDs: string[];
  onSelectAll: VoidFunction;
  onSelectNone: VoidFunction;
  actionItems: React.ReactNode[];
};

const HostToolbar: React.FC<HostToolbarProps> = ({
  hostIDs,
  selectedHostIDs,
  onSelectAll,
  onSelectNone,
  actionItems,
}) => {
  const [actionsOpen, setActionsOpen] = React.useState(false);
  const [selectOpen, setSelectOpen] = React.useState(false);
  const onSelectToggle = React.useCallback(() => setSelectOpen(!selectOpen), [selectOpen]);
  const onActionsToggle = React.useCallback(() => setActionsOpen(!actionsOpen), [actionsOpen]);

  let isChecked: boolean | null = false;
  if (selectedHostIDs.length) {
    isChecked =
      selectedHostIDs.length === hostIDs.length &&
      hostIDs.every((id) => selectedHostIDs.includes(id))
        ? true
        : null;
  }

  const isDisabled = isChecked === false;

  return (
    <>
      <ActionList>
        <ActionListItem>
          <Dropdown
            onSelect={onSelectToggle}
            toggle={
              <DropdownToggle
                splitButtonItems={[
                  <DropdownToggleCheckbox
                    id="select-checkbox"
                    key="select-checkbox"
                    aria-label="Select all"
                    onChange={(checked) => (checked ? onSelectAll() : onSelectNone())}
                    isChecked={isChecked}
                  >
                    {selectedHostIDs.length} selected
                  </DropdownToggleCheckbox>,
                ]}
                onToggle={onSelectToggle}
              />
            }
            isOpen={selectOpen}
            dropdownItems={[
              <DropdownItem key="select-all" onClick={onSelectAll}>
                Select all
              </DropdownItem>,
              <DropdownItem key="select-none" onClick={onSelectNone}>
                Select none
              </DropdownItem>,
            ]}
          />
        </ActionListItem>
        <ActionListItem>
          <ActionItemsContext.Provider value={isDisabled}>
            <Dropdown
              onSelect={onActionsToggle}
              toggle={
                <DropdownToggle
                  onToggle={onActionsToggle}
                  toggleIndicator={CaretDownIcon}
                  isPrimary
                >
                  Actions
                </DropdownToggle>
              }
              isOpen={actionsOpen}
              dropdownItems={actionItems}
            />
          </ActionItemsContext.Provider>
        </ActionListItem>
      </ActionList>
    </>
  );
};

export default HostToolbar;
