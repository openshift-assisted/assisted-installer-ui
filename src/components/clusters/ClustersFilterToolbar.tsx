import React from 'react';
import {
  Toolbar,
  ToolbarItem,
  ToolbarContent,
  ToolbarFilter,
  ToolbarToggleGroup,
  ToolbarGroup,
  Button,
  ButtonVariant,
  InputGroup,
  Select,
  SelectOption,
  TextInput,
  ToolbarProps,
  ToolbarFilterProps,
  SelectProps,
  TextInputProps,
} from '@patternfly/react-core';
import { SearchIcon, FilterIcon } from '@patternfly/react-icons';
import { Cluster } from '../../api/types';
import { CLUSTER_STATUS_LABELS } from '../../config';

export type ClusterFiltersType = {
  [key: string]: string[]; // value from CLUSTER_STATUS_LABELS
};

type ClustersFilterToolbarProps = {
  searchName: string;
  setSearchName: (value: string) => void;
  filters: ClusterFiltersType;
  setFilters: (filters: ClusterFiltersType) => void;
};

const ClustersFilterToolbar: React.FC<ClustersFilterToolbarProps> = ({
  searchName,
  setSearchName,
  filters,
  setFilters,
}) => {
  const [isStatusExpanded, setStatusExpanded] = React.useState(false);

  const onClearAllFilters: ToolbarProps['clearAllFilters'] = () => {
    setFilters({
      status: [],
    });
  };

  const onSearchNameChanged: TextInputProps['onChange'] = setSearchName;

  const onSelect = (type: string, isChecked: boolean, value: Cluster['status']) => {
    setFilters({
      ...filters,
      [type]: isChecked
        ? [...filters[type], value]
        : filters[type].filter((v: string) => v !== value),
    });
  };

  const onStatusToggle: SelectProps['onToggle'] = () => setStatusExpanded(!isStatusExpanded);
  const onStatusSelect: SelectProps['onSelect'] = (event, value) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    onSelect('status', event.target.checked, value as string);
  };

  const onDeleteChip: ToolbarFilterProps['deleteChip'] = (type, id) => {
    if (type) {
      setFilters({
        ...filters,
        [type as string]: filters[type as string].filter((v: string) => v !== id),
      });
    } else {
      onClearAllFilters();
    }
  };

  const onDeleteChipGroup: ToolbarFilterProps['deleteChipGroup'] = (type) => {
    setFilters({
      ...filters,
      [type as string]: [],
    });
  };

  return (
    <Toolbar
      id="clusters-filter-toolbar"
      className="pf-m-toggle-group-container"
      collapseListedFiltersBreakpoint="xl"
      clearAllFilters={onClearAllFilters}
    >
      <ToolbarContent>
        <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="xl">
          <ToolbarItem>
            <InputGroup>
              <TextInput
                name="search-name"
                id="search-name"
                type="search"
                aria-label="cluster name to be searched"
                onChange={onSearchNameChanged}
                value={searchName}
              />
              <Button variant={ButtonVariant.control} aria-label="search cluster name button">
                <SearchIcon />
              </Button>
            </InputGroup>
          </ToolbarItem>
          <ToolbarGroup variant="filter-group">
            <ToolbarFilter
              chips={filters.status}
              deleteChip={onDeleteChip}
              deleteChipGroup={onDeleteChipGroup}
              categoryName="status"
            >
              <Select
                variant="checkbox"
                aria-label="status"
                onToggle={onStatusToggle}
                onSelect={onStatusSelect}
                selections={filters.status}
                isOpen={isStatusExpanded}
                placeholderText="Status"
              >
                {Object.getOwnPropertyNames(CLUSTER_STATUS_LABELS).map((status) => (
                  <SelectOption key={status} value={CLUSTER_STATUS_LABELS[status]} />
                ))}
              </Select>
            </ToolbarFilter>
          </ToolbarGroup>
        </ToolbarToggleGroup>
      </ToolbarContent>
    </Toolbar>
  );
};

export default ClustersFilterToolbar;
