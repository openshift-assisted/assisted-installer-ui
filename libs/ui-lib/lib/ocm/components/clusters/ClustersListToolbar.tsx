import React from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import {
  Toolbar,
  ToolbarItem,
  ToolbarContent,
  InputGroup,
  TextInput,
  ToolbarProps,
  ToolbarFilterProps,
  TextInputProps,
  ButtonVariant,
  Spinner,
  ToolbarGroup,
  Tooltip,
  InputGroupItem,
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
} from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons/dist/js/icons/filter-icon';
import { SyncIcon } from '@patternfly/react-icons/dist/js/icons/sync-icon';
import { clusterStatusLabels, isSelectEventChecked, ToolbarButton } from '../../../common';
import { ResourceUIState } from '../../../common';
import { fetchClustersAsync } from '../../store/slices/clusters/slice';
import omit from 'lodash-es/omit.js';
import { TFunction } from 'i18next';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';
import { useDispatchDay1, useSelectorDay1 } from '../../store';
import { selectClustersUIState } from '../../store/slices/clusters/selectors';
import { CustomToolbarFilter } from '../../../common/components/ui/CustomToolbarFilter';

export type ClusterFiltersType = {
  [key: string]: string[]; // value from clusterStatusLabels
};

type ClustersListToolbarProps = {
  searchString: string;
  setSearchString: TextInputProps['onChange'];
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
  const navigate = useNavigate();
  const clustersUIState = useSelectorDay1(selectClustersUIState);
  const dispatch = useDispatchDay1();
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

  const onStatusToggle = () => setStatusExpanded(!isStatusExpanded);
  const onStatusSelect = (
    val: string,
    event?: React.MouseEvent | React.ChangeEvent | undefined,
  ) => {
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
            <InputGroupItem isFill>
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
            </InputGroupItem>
          </InputGroup>
        </ToolbarItem>
        <CustomToolbarFilter
          chips={filters.status}
          deleteChip={onDeleteChip}
          deleteChipGroup={onDeleteChipGroup}
          categoryName="status"
        >
          <Dropdown
            isOpen={isStatusExpanded}
            onSelect={(event, value) => onStatusSelect(value as string, event)}
            onOpenChange={onStatusToggle}
            toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
              <MenuToggle
                id="cluster-list-filter-status"
                ref={toggleRef}
                isFullWidth
                onClick={onStatusToggle}
                isExpanded={isStatusExpanded}
              >
                {statusPlaceholder}
              </MenuToggle>
            )}
            shouldFocusToggleOnSelect
          >
            <DropdownList>
              {clusterStatusFilterLabels(t).map((label) => (
                <DropdownItem
                  id={`cluster-list-filter-status-${label}`}
                  hasCheckbox
                  isSelected={filters.status.includes(label)}
                  key={label}
                  value={label}
                >
                  {label}
                </DropdownItem>
              ))}
            </DropdownList>
          </Dropdown>
        </CustomToolbarFilter>
        <ToolbarButton
          variant={ButtonVariant.primary}
          onClick={() => navigate(`~new`)}
          id="button-create-new-cluster"
          data-ouia-id="button-create-new-cluster"
        >
          Create Cluster
        </ToolbarButton>
        {clustersUIState === ResourceUIState.RELOADING && <Spinner size="lg" />}
        <ToolbarGroup align={{ lg: 'alignRight' }}>
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
