import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
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
  ButtonVariant,
  Spinner,
  ToolbarGroup,
  Tooltip,
} from '@patternfly/react-core';
import { FilterIcon, SyncIcon } from '@patternfly/react-icons';
import { Cluster, clusterStatusLabels, isSelectEventChecked, ToolbarButton } from '../../../common';
import { ResourceUIState } from '../../../common';
import { selectClustersUIState } from '../../selectors';
import { ClustersDispatch, fetchClustersAsync } from '../../reducers/clusters';
import { routeBasePath } from '../../config';
import omit from 'lodash/omit';
import { TFunction } from 'i18next';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';

export type ClusterFiltersType = {
  [key: string]: string[]; // value from clusterStatusLabels
};

type ClustersListToolbarProps = {
  searchString: string;
  setSearchString: (value: string) => void;
  filters: ClusterFiltersType;
  setFilters: (filters: ClusterFiltersType) => void;
};

const clusterStatusFilterLabels = (t: TFunction) =>
  Array.from(new Set(Object.values(omit(clusterStatusLabels(t), 'adding-hosts'))));

const ClustersListToolbar: React.FC<ClustersListToolbarProps> = ({
  searchString,
  setSearchString,
  filters,
  setFilters,
}) => {
  const [isStatusExpanded, setStatusExpanded] = React.useState(false);
  const history = useHistory();
  const clustersUIState = useSelector(selectClustersUIState);
  const dispatch = useDispatch<ClustersDispatch>();
  const fetchClusters = React.useCallback(() => void dispatch(fetchClustersAsync()), [dispatch]);

  const onClearAllFilters: ToolbarProps['clearAllFilters'] = () => {
    setFilters({
      status: [],
    });
  };

  const onSearchNameChanged: TextInputProps['onChange'] = setSearchString;

  const onSelect = (type: string, isChecked: boolean, value: Cluster['status']) => {
    setFilters({
      ...filters,
      [type]: isChecked
        ? [...filters[type], value]
        : filters[type].filter((v: string) => v !== value),
    });
  };

  const onStatusToggle: SelectProps['onToggle'] = () => setStatusExpanded(!isStatusExpanded);
  const onStatusSelect: SelectProps['onSelect'] = (event, val) => {
    const value = val as Cluster['status'];
    onSelect('status', isSelectEventChecked(event), value);
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

  const statusPlaceholder = (
    <>
      <FilterIcon /> Status
    </>
  );
  const { t } = useTranslation();
  return (
    <Toolbar
      id="clusters-list-toolbar"
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
              value={searchString}
              placeholder="Filter by Name, ID or Base domain"
              title="Filter by Name, ID or Base domain"
            />
          </InputGroup>
        </ToolbarItem>
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
            placeholderText={statusPlaceholder}
            toggleId="cluster-list-filter-status"
          >
            {clusterStatusFilterLabels(t).map((label) => (
              <SelectOption
                key={label}
                value={label}
                inputId={`cluster-list-filter-status-${label}`}
              />
            ))}
          </Select>
        </ToolbarFilter>
        <ToolbarButton
          variant={ButtonVariant.primary}
          onClick={() => history.push(`${routeBasePath}/clusters/~new`)}
          id="button-create-new-cluster"
          data-ouia-id="button-create-new-cluster"
        >
          Create Cluster
        </ToolbarButton>
        {clustersUIState === ResourceUIState.RELOADING && <Spinner size="lg" />}
        <ToolbarGroup alignment={{ lg: 'alignRight' }}>
          <ToolbarButton
            variant={ButtonVariant.plain}
            onClick={() => fetchClusters()}
            isDisabled={clustersUIState === ResourceUIState.RELOADING}
          >
            <Tooltip content="Refresh">
              <SyncIcon />
            </Tooltip>
          </ToolbarButton>
        </ToolbarGroup>
      </ToolbarContent>
    </Toolbar>
  );
};

export default ClustersListToolbar;
