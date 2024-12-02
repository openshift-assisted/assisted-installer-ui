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
import {
  Dropdown,
  DropdownItem,
  DropdownToggle,
  DropdownToggleCheckbox,
} from '@patternfly/react-core/deprecated';
import { CaretDownIcon } from '@patternfly/react-icons/dist/js/icons/caret-down-icon';
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
      onSelect={onActionsToggle}
      toggle={
        <DropdownToggle
          onToggle={onActionsToggle}
          toggleIndicator={CaretDownIcon}
          isDisabled={isDisabled}
        >
          {t('ai:Actions')}
        </DropdownToggle>
      }
      isOpen={actionsOpen}
      dropdownItems={actions}
    />
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
                onSelect={onSelectToggle}
                toggle={
                  <DropdownToggle
                    splitButtonItems={[
                      <DropdownToggleCheckbox
                        id="select-checkbox"
                        key="select-checkbox"
                        aria-label={t('ai:Select all')}
                        onChange={(_event, checked) => (checked ? onSelectAll() : onSelectNone())}
                        isChecked={isChecked}
                      >
                        {selectedIDs.length} {t('ai:selected')}
                      </DropdownToggleCheckbox>,
                    ]}
                    onToggle={onSelectToggle}
                  />
                }
                isOpen={selectOpen}
                dropdownItems={[
                  <DropdownItem key="select-all" onClick={onSelectAll}>
                    {t('ai:Select all')}
                  </DropdownItem>,
                  <DropdownItem key="select-none" onClick={onSelectNone}>
                    {t('ai:Select none')}
                  </DropdownItem>,
                ]}
              />
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
