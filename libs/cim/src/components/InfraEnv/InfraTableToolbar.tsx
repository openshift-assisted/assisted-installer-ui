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
import { HostStatus, HostStatusDef } from '@openshift-assisted/common/components/hosts/types';
import { agentStatus } from '../helpers/agentStatus';
import { TableToolbar } from '@openshift-assisted/common';
import { usePagination } from '@openshift-assisted/common/components/hosts/usePagination';
import { useTranslation } from '@openshift-assisted/common/hooks/use-translation-wrapper';
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
  hostLabels: { [key in string]: number };
  statusFilter: string[];
  labelFilter: string[];
  statusCount: StatusCount;
  hostnameFilter: string | undefined;
  setHostnameFilter: (hostname: string | undefined) => void;
  setStatusFilter: (status: string[]) => void;
  setLabelFilter: (label: string[]) => void;
  selectedHostIDs: string[];
};

const InfraTableToolbar: React.FC<InfraTableToolbarProps> = ({
  setSelectedHostIDs,
  massActions,
  hosts,
  hostLabels,
  statusFilter,
  labelFilter,
  statusCount,
  hostnameFilter,
  setHostnameFilter,
  setStatusFilter,
  setLabelFilter,
  selectedHostIDs,
  ...paginationProps
}) => {
  const { t } = useTranslation();
  const agentStatuses = agentStatus(t);
  const [statusFilterOpen, setStatusFilterOpen] = React.useState(false);
  const [labelFilterOpen, setLabelFilterOpen] = React.useState(false);

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

  const onLabelFilterToggle = () => setLabelFilterOpen(!labelFilterOpen);
  const onLabelFilterSelect = (
    e?: React.MouseEvent<Element, MouseEvent>,
    value?: string | number,
  ) => {
    if (!labelFilter?.includes(value as string)) {
      const newItems = (labelFilter ? [...labelFilter, value] : [value]) as string[];
      setLabelFilter(newItems);
    } else {
      setLabelFilter(labelFilter?.filter((f) => f !== value));
    }
  };

  return (
    <TableToolbar
      selectedIDs={selectedHostIDs || []}
      itemIDs={itemIDs}
      setSelectedIDs={setSelectedHostIDs}
      actions={massActions}
      clearAllFilters={() => {
        setStatusFilter([]);
        setLabelFilter([]);
      }}
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
          labels={statusFilter}
          deleteLabel={(_, label) => setStatusFilter(statusFilter?.filter((f) => f !== label))}
          deleteLabelGroup={() => setStatusFilter([])}
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

      <ToolbarItem>
        <ToolbarFilter
          labels={labelFilter}
          deleteLabel={(_, label) => setLabelFilter(labelFilter.filter((f) => f !== label))}
          deleteLabelGroup={() => setLabelFilter([])}
          categoryName={'Labels'}
        >
          <Dropdown
            isOpen={labelFilterOpen}
            onSelect={onLabelFilterSelect}
            onOpenChange={onLabelFilterToggle}
            shouldFocusToggleOnSelect
            toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
              <MenuToggle
                ref={toggleRef}
                isFullWidth
                onClick={onLabelFilterToggle}
                isExpanded={labelFilterOpen}
                icon={<FilterIcon />}
              >
                {t('ai:Labels')}
              </MenuToggle>
            )}
          >
            <DropdownGroup label={t('ai:Labels')}>
              {Object.keys(hostLabels).length > 0 ? (
                Object.entries(hostLabels).map(([label, count]) => (
                  <DropdownItem
                    hasCheckbox
                    key={`host-label-${label}`}
                    value={label}
                    isSelected={labelFilter?.includes(label)}
                  >
                    <Split hasGutter>
                      <SplitItem>{label}</SplitItem>
                      <SplitItem>
                        <Badge isRead>{count || 0}</Badge>
                      </SplitItem>
                    </Split>
                  </DropdownItem>
                ))
              ) : (
                <DropdownItem key="no-labels" isDisabled>
                  {t('ai:No labels available')}
                </DropdownItem>
              )}
            </DropdownGroup>
          </Dropdown>
        </ToolbarFilter>
      </ToolbarItem>
    </TableToolbar>
  );
};

export default InfraTableToolbar;
