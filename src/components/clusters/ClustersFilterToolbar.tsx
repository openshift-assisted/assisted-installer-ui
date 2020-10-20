import React from 'react';
import {
  Toolbar,
  ToolbarItem,
  ToolbarContent,
  ToolbarFilter,
  InputGroup,
  Select,
  SelectOption,
  TextInput,
  ToolbarProps,
  ToolbarFilterProps,
  SelectProps,
  TextInputProps,
  DropdownSeparator,
} from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';
import { CLUSTER_STATUS_LABELS } from '../../config';

export type ClusterListFilter = {
  status: {
    [key: string]: boolean; // key from CLUSTER_STATUS_LABELS
  };
  searchString: string;
  unregistered: boolean;
};

export type ClustersFilterToolbarProps = {
  clusterListFilter: ClusterListFilter;
  setClusterListFilter: (filters: ClusterListFilter) => void;
};

export const initialClusterListFilter: ClusterListFilter = {
  status: {},
  searchString: '',
  unregistered: false,
};

const UNREGISTERED = 'Unregistered';

const ClustersFilterToolbar: React.FC<ClustersFilterToolbarProps> = ({
  clusterListFilter,
  setClusterListFilter,
}) => {
  const [isStatusExpanded, setStatusExpanded] = React.useState(false);

  const onClearAllFilters: ToolbarProps['clearAllFilters'] = () => {
    setClusterListFilter({ ...initialClusterListFilter });
  };

  const onSearchNameChanged: TextInputProps['onChange'] = (value) =>
    setClusterListFilter({
      ...clusterListFilter,
      searchString: value,
    });

  const onSelect = (state: string, isChecked: boolean) => {
    if (state === UNREGISTERED) {
      setClusterListFilter({
        ...clusterListFilter,
        unregistered: isChecked,
      });
    } else {
      setClusterListFilter({
        ...clusterListFilter,
        status: {
          ...clusterListFilter.status,
          [state]: isChecked,
        },
      });
    }
  };

  const onStatusToggle: SelectProps['onToggle'] = () => setStatusExpanded(!isStatusExpanded);
  const onStatusSelect: SelectProps['onSelect'] = (event, value) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    const isChecked = event.target.checked;
    onSelect(value as string, isChecked);
  };

  const onDeleteChip: ToolbarFilterProps['deleteChip'] = (type, id) => {
    if (type) {
      onSelect(id as string, false);
    } else {
      onClearAllFilters();
    }
  };

  const onDeleteChipGroup: ToolbarFilterProps['deleteChipGroup'] = (type) => {
    if (type) {
      setClusterListFilter({
        ...clusterListFilter,
        status: {},
        unregistered: false,
      });
    } else {
      onClearAllFilters();
    }
  };

  const statusPlaceholder = (
    <>
      <FilterIcon /> Status
    </>
  );

  const selectedStates = Object.getOwnPropertyNames(clusterListFilter.status).filter(
    (state) => clusterListFilter.status[state],
  );
  if (clusterListFilter.unregistered) {
    selectedStates.push(UNREGISTERED);
  }

  return (
    <Toolbar
      id="clusters-filter-toolbar"
      className="pf-m-toggle-group-container"
      collapseListedFiltersBreakpoint="xl"
      clearAllFilters={onClearAllFilters}
    >
      <ToolbarContent>
        <ToolbarItem>
          <InputGroup>
            <TextInput
              name="search-string"
              id="search-string"
              type="search"
              aria-label="string to be searched in cluster names or ids"
              onChange={onSearchNameChanged}
              value={clusterListFilter.searchString}
              placeholder="Search by Name, ID or Base domain"
              title="Search by Name, ID or Base domain"
            />
          </InputGroup>
        </ToolbarItem>
        <ToolbarFilter
          chips={selectedStates}
          deleteChip={onDeleteChip}
          deleteChipGroup={onDeleteChipGroup}
          categoryName="status"
        >
          <Select
            variant="checkbox"
            aria-label="status"
            onToggle={onStatusToggle}
            onSelect={onStatusSelect}
            selections={selectedStates}
            isOpen={isStatusExpanded}
            placeholderText={statusPlaceholder}
          >
            {[
              <SelectOption
                key={UNREGISTERED}
                value={UNREGISTERED}
                id={`cluster-list-filter-status-unregistered`}
              >
                Include unregistered clusters
              </SelectOption>,
              {
                /* TODO: Separator */
              },
              ...Object.keys(CLUSTER_STATUS_LABELS).map((status) => (
                <SelectOption
                  key={status}
                  value={CLUSTER_STATUS_LABELS[status]}
                  id={`cluster-list-filter-status-${status}`}
                />
              )),
            ]}
          </Select>
        </ToolbarFilter>
      </ToolbarContent>
    </Toolbar>
  );
};

export default ClustersFilterToolbar;
