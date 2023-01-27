import {
  Badge,
  Grid,
  GridItem,
  SearchInput,
  Select,
  SelectGroup,
  SelectOption,
  SelectVariant,
  Split,
  SplitItem,
  ToolbarFilter,
  ToolbarItem,
} from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';
import * as React from 'react';
import { HostStatus } from '../../../common/components/hosts/types';
import { agentStatus } from '../helpers/agentStatus';
import { Host, TableToolbar } from '../../../common';
import { usePagination } from '../../../common/components/hosts/usePagination';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { StatusCount } from '../Agent/tableUtils';

const getStatusesForFiler = (statuses: HostStatus<string>) => {
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
  const [statusFilterOpen, setStatusFilterOpen] = React.useState(false);
  const filterStatuses = React.useMemo(() => getStatusesForFiler(agentStatus), []);
  const { t } = useTranslation();
  const itemIDs = React.useMemo(() => hosts.map((h) => h.id), [hosts]);
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
          onChange={setHostnameFilter}
          onClear={() => setHostnameFilter(undefined)}
        />
      </ToolbarItem>
      <ToolbarItem>
        <ToolbarFilter
          chips={statusFilter}
          deleteChip={(category, chip) => setStatusFilter(statusFilter?.filter((f) => f !== chip))}
          deleteChipGroup={() => setStatusFilter([])}
          categoryName="Status"
        >
          <Select
            variant={SelectVariant.checkbox}
            aria-label={t('ai:Status')}
            onToggle={setStatusFilterOpen}
            onSelect={(e, value) => {
              // eslint-disable-next-line
              if ((e.target as any).checked) {
                const newItems = (statusFilter ? [...statusFilter, value] : [value]) as string[];
                setStatusFilter(newItems);
              } else {
                setStatusFilter(statusFilter?.filter((f) => f !== value));
              }
            }}
            selections={statusFilter}
            isOpen={statusFilterOpen}
            placeholderText={t('ai:Status')}
            toggleIcon={<FilterIcon />}
          >
            {[
              <Grid key="statuses" hasGutter className="table-toolbar__dropdown">
                {Object.keys(filterStatuses).map((category) => (
                  <GridItem key={category} span={4}>
                    <SelectGroup label={category}>
                      {Object.keys(filterStatuses[category]).map((label) => (
                        <SelectOption
                          key={label}
                          value={label}
                          isChecked={statusFilter?.includes(label)}
                        >
                          <Split hasGutter>
                            <SplitItem>{label}</SplitItem>
                            <SplitItem>
                              <Badge isRead>{statusCount[label] || 0}</Badge>
                            </SplitItem>
                          </Split>
                        </SelectOption>
                      ))}
                    </SelectGroup>
                  </GridItem>
                ))}
              </Grid>,
            ]}
          </Select>
        </ToolbarFilter>
      </ToolbarItem>
    </TableToolbar>
  );
};

export default InfraTableToolbar;
