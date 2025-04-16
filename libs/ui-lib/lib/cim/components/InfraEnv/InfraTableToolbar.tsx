import {
  Badge,
  Dropdown,
  DropdownGroup,
  DropdownItem,
  Grid,
  GridItem,
  MenuToggle,
  MenuToggleElement,
  SearchInput,
  Split,
  SplitItem,
  ToolbarFilter,
  ToolbarItem,
} from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons/dist/js/icons/filter-icon';
import * as React from 'react';
import { HostStatus, HostStatusDef } from '../../../common/components/hosts/types';
import { agentStatus } from '../helpers/agentStatus';
import { TableToolbar } from '../../../common';
import { usePagination } from '../../../common/components/hosts/usePagination';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { StatusCount } from '../Agent/tableUtils';
import { Host } from '@openshift-assisted/types/assisted-installer-service';
import { TFunction } from 'i18next';

const getStatusesForFilter = (statuses: HostStatus<string>) => {
  const filterStatuses: {
    [category: string]: {
      [label: string]: string[];
    };
  } = {};

  const sortedStatuses = Object.keys(statuses).sort((a, b) =>
    statuses[a].title.localeCompare(statuses[b].title),
  );

  sortedStatuses.forEach((status) => {
    const { category, title } = statuses[status];
    if (filterStatuses[category]) {
      if (filterStatuses[category][title]) {
        filterStatuses[category][title].push(status);
      } else {
        filterStatuses[category] = {
          ...filterStatuses[category],
          [title]: [status],
        };
      }
    } else {
      filterStatuses[category] = {
        [title]: [status],
      };
    }
  });

  return filterStatuses;
};

const getCategoryLabels = (t: TFunction): { [k in HostStatusDef['category']]: string } => ({
  'Installation related': t('ai:Installation related'),
  'Discovery related': t('ai:Discovery related'),
  'Bare Metal Host related': t('ai:Bare Metal Host related'),
});

type InfraTableToolbarProps = ReturnType<typeof usePagination> & {
  setSelectedHostIDs: (items: string[]) => void;
  massActions: React.ReactNode[];
  hosts: Host[];
  statusFilter: string[];
  statusCount: StatusCount;
  hostnameFilter: string | undefined;
  setHostnameFilter: (hostname: string | undefined) => void;
  setStatusFilter: (status: string[]) => void;
  selectedHostIDs: string[];
};

const InfraTableToolbar: React.FC<InfraTableToolbarProps> = ({
  setSelectedHostIDs,
  massActions,
  hosts,
  statusFilter,
  statusCount,
  hostnameFilter,
  setHostnameFilter,
  setStatusFilter,
  selectedHostIDs,
  ...paginationProps
}) => {
  const { t } = useTranslation();
  const agentStatuses = agentStatus(t);
  const [statusFilterOpen, setStatusFilterOpen] = React.useState(false);
  const itemIDs = React.useMemo(() => hosts.map((h) => h.id), [hosts]);
  const filterStatuses = React.useMemo(() => getStatusesForFilter(agentStatuses), [agentStatuses]);
  const categoryLabels = getCategoryLabels(t);

  const onStatusFilterToggle = () => setStatusFilterOpen(!statusFilterOpen);
  const onStatusFilterSelect = (
    e?: React.MouseEvent<Element, MouseEvent>,
    value?: string | number,
  ) => {
    if (!statusFilter?.includes(value as string)) {
      const newItems = (statusFilter ? [...statusFilter, value] : [value]) as string[];
      setStatusFilter(newItems);
    } else {
      setStatusFilter(statusFilter?.filter((f) => f !== value));
    }
  };

  return (
    <TableToolbar
      selectedIDs={selectedHostIDs || []}
      itemIDs={itemIDs}
      setSelectedIDs={setSelectedHostIDs}
      actions={massActions}
      clearAllFilters={() => setStatusFilter([])}
      {...paginationProps}
    >
      <ToolbarItem>
        <SearchInput
          placeholder={t('ai:Find by hostname')}
          value={hostnameFilter}
          onChange={(_e, value) => setHostnameFilter(value)}
          onClear={() => setHostnameFilter(undefined)}
        />
      </ToolbarItem>
      <ToolbarItem>
        <ToolbarFilter
          chips={statusFilter}
          deleteChip={(_, chip) => setStatusFilter(statusFilter?.filter((f) => f !== chip))}
          deleteChipGroup={() => setStatusFilter([])}
          categoryName="Status"
        >
          <Dropdown
            isOpen={statusFilterOpen}
            onSelect={onStatusFilterSelect}
            onOpenChange={onStatusFilterToggle}
            toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
              <MenuToggle
                ref={toggleRef}
                isFullWidth
                onClick={onStatusFilterToggle}
                isExpanded={statusFilterOpen}
                icon={<FilterIcon />}
              >
                {t('ai:Status')}
              </MenuToggle>
            )}
            shouldFocusToggleOnSelect
          >
            {[
              <Grid key="statuses" hasGutter className="table-toolbar__dropdown">
                {Object.keys(filterStatuses).map((category) => (
                  <GridItem key={category} span={4}>
                    <DropdownGroup label={categoryLabels[category as HostStatusDef['category']]}>
                      {Object.keys(filterStatuses[category]).map((label) => (
                        <DropdownItem
                          hasCheckbox
                          key={label}
                          value={label}
                          isSelected={statusFilter?.includes(label)}
                        >
                          <Split hasGutter>
                            <SplitItem>{label}</SplitItem>
                            <SplitItem>
                              <Badge isRead>{statusCount[label] || 0}</Badge>
                            </SplitItem>
                          </Split>
                        </DropdownItem>
                      ))}
                    </DropdownGroup>
                  </GridItem>
                ))}
              </Grid>,
            ]}
          </Dropdown>
        </ToolbarFilter>
      </ToolbarItem>
    </TableToolbar>
  );
};

export default InfraTableToolbar;
