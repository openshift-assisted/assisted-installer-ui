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
  Dropdown,
  DropdownItem,
  MenuToggle,
  MenuToggleElement,
  DropdownList,
  MenuToggleCheckbox,
} from '@patternfly/react-core';
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
  const onSelectAll = () => setSelectedIDs(itemIDs);
  const onSelectNone = () => setSelectedIDs([]);

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
      onSelect={onActionsToggle}
      onOpenChange={onActionsToggle}
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle ref={toggleRef} isFullWidth onClick={onActionsToggle} isExpanded={actionsOpen}>
          {t('ai:Actions')}
        </MenuToggle>
      )}
      isOpen={actionsOpen}
    >
      {actions}
    </Dropdown>
  );

  const SelectDropdown = (
    <Dropdown
      onSelect={onSelectToggle}
      onOpenChange={onSelectToggle}
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={toggleRef}
          isFullWidth
          onClick={onSelectToggle}
          isExpanded={selectOpen}
          splitButtonItems={[
              <MenuToggleCheckbox
                id="select-checkbox"
                key="select-checkbox"
                aria-label="Select all"
                onChange={(checked, _event) => (checked ? onSelectAll() : onSelectNone())}
                isChecked={isChecked}
              >
                {selectedIDs.length} {t('ai:selected')}
              </MenuToggleCheckbox>,
            ]}
        />
      )}
      isOpen={selectOpen}
    >
      <DropdownList>
        <DropdownItem id={'select-all'} key="select-all" onClick={onSelectAll}>
          {t('ai:Select all')}
        </DropdownItem>
        <DropdownItem id={'select-none'} key="select-none" onClick={onSelectNone}>
          {t('ai:Select none')}
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );

  return (
    <Split hasGutter>
      <SplitItem isFilled>
        <Toolbar className="table-toolbar" clearAllFilters={clearAllFilters}>
          <ToolbarContent className="table-toolbar__content">
            <ToolbarItem>{SelectDropdown}</ToolbarItem>
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
