import * as React from 'react';
import {
  OnPerPageSelect,
  OnSetPage,
  Pagination,
  PerPageOptions,
  Split,
  SplitItem,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  ToolbarProps,
  Tooltip,
} from '@patternfly/react-core';
import { Dropdown, DropdownItem, MenuToggle, MenuToggleCheckbox } from '@patternfly/react-core';
import { useTranslation } from '../../hooks/use-translation-wrapper';

import './TableToolbar.css';

type TableToolbarProps = {
  itemIDs: string[];
  selectedIDs: string[];
  setSelectedIDs: (selectedIDs: string[]) => void;
  actions?: React.ReactNode[];
  showPagination: boolean;
  perPage: number;
  onPerPageSelect: OnPerPageSelect;
  page: number;
  onSetPage: OnSetPage;
  perPageOptions: PerPageOptions[];
  clearAllFilters?: ToolbarProps['clearAllFilters'];
};

const TableToolbar: React.FC<TableToolbarProps> = ({
  itemIDs,
  selectedIDs,
  setSelectedIDs,
  actions,
  showPagination,
  clearAllFilters,
  children,
  ...paginationProps
}) => {
  const { t } = useTranslation();
  const [actionsOpen, setActionsOpen] = React.useState(false);
  const [selectOpen, setSelectOpen] = React.useState(false);
  const onSelectToggle = React.useCallback(() => setSelectOpen(!selectOpen), [selectOpen]);
  const onActionsToggle = React.useCallback(() => setActionsOpen(!actionsOpen), [actionsOpen]);

  React.useEffect(() => {
    if (!selectedIDs.every((id) => itemIDs.includes(id))) {
      setSelectedIDs(selectedIDs.filter((id) => itemIDs.includes(id)));
    }
  }, [selectedIDs, itemIDs, setSelectedIDs]);

  let isChecked: boolean | null = false;
  if (selectedIDs.length) {
    isChecked =
      selectedIDs.length === itemIDs.length && itemIDs.every((id) => selectedIDs.includes(id))
        ? true
        : null;
  }

  const isDisabled = isChecked === false;

  const actionsDropdown = (
    <Dropdown
      isOpen={actionsOpen}
      onSelect={() => setActionsOpen(false)}
      toggle={(toggleRef) => (
        <MenuToggle
          ref={toggleRef}
          onClick={onActionsToggle}
          isDisabled={isDisabled}
          isExpanded={actionsOpen}
        >
          {t('ai:Actions')}
        </MenuToggle>
      )}
    >
      {actions}
    </Dropdown>
  );

  const onSelectAll = () => setSelectedIDs(itemIDs);
  const onSelectNone = () => setSelectedIDs([]);

  return (
    <Split hasGutter>
      <SplitItem isFilled>
        <Toolbar className="table-toolbar" clearAllFilters={clearAllFilters}>
          <ToolbarContent className="table-toolbar__content">
            <ToolbarItem>
              <Dropdown
                isOpen={selectOpen}
                onSelect={() => setSelectOpen(false)}
                toggle={(toggleRef) => (
                  <MenuToggleCheckbox
                    ref={toggleRef}
                    id="select-checkbox"
                    aria-label={t('ai:Select all')}
                    onClick={onSelectToggle}
                    onChange={(checked) => (checked ? onSelectAll() : onSelectNone())}
                    isChecked={isChecked}
                  >
                    {selectedIDs.length} {t('ai:selected')}
                  </MenuToggleCheckbox>
                )}
              >
                <DropdownItem key="select-all" onClick={onSelectAll}>
                  {t('ai:Select all')}
                </DropdownItem>
                <DropdownItem key="select-none" onClick={onSelectNone}>
                  {t('ai:Select none')}
                </DropdownItem>
              </Dropdown>
            </ToolbarItem>
            {children}
            <ToolbarItem>
              {isDisabled ? (
                <Tooltip content={t('ai:Select one or more hosts')}>{actionsDropdown}</Tooltip>
              ) : (
                actionsDropdown
              )}
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
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
