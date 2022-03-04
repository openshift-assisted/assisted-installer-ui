import * as React from 'react';
import {
  ActionList,
  ActionListItem,
  Dropdown,
  DropdownItem,
  DropdownToggle,
  DropdownToggleCheckbox,
  OnPerPageSelect,
  OnSetPage,
  Pagination,
  PerPageOptions,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import { CaretDownIcon } from '@patternfly/react-icons';

export const ActionItemsContext = React.createContext(false);

type TableToolbarProps = {
  itemIDs: string[];
  selectedIDs: string[];
  onSelectAll: VoidFunction;
  onSelectNone: VoidFunction;
  actions?: React.ReactNode[];
  showPagination: boolean;
  perPage: number;
  onPerPageSelect: OnPerPageSelect;
  page: number;
  onSetPage: OnSetPage;
  perPageOptions: PerPageOptions[];
};

const TableToolbar: React.FC<TableToolbarProps> = ({
  itemIDs,
  selectedIDs,
  onSelectAll,
  onSelectNone,
  actions,
  showPagination,
  ...paginationProps
}) => {
  const [actionsOpen, setActionsOpen] = React.useState(false);
  const [selectOpen, setSelectOpen] = React.useState(false);
  const onSelectToggle = React.useCallback(() => setSelectOpen(!selectOpen), [selectOpen]);
  const onActionsToggle = React.useCallback(() => setActionsOpen(!actionsOpen), [actionsOpen]);

  let isChecked: boolean | null = false;
  if (selectedIDs.length) {
    isChecked =
      selectedIDs.length === itemIDs.length && itemIDs.every((id) => selectedIDs.includes(id))
        ? true
        : null;
  }

  const isDisabled = isChecked === false;

  return (
    <Split hasGutter>
      <SplitItem isFilled>
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
                      {selectedIDs.length} selected
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
          {actions && (
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
                  dropdownItems={actions}
                />
              </ActionItemsContext.Provider>
            </ActionListItem>
          )}
        </ActionList>
      </SplitItem>
      {showPagination && (
        <SplitItem>
          <Pagination itemCount={itemIDs.length} {...paginationProps} isCompact />
        </SplitItem>
      )}
    </Split>
  );
};

export default TableToolbar;
