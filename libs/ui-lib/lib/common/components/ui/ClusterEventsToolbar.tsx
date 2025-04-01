import React from 'react';
import capitalize from 'lodash-es/capitalize.js';
import {
  Toolbar,
  ToolbarItem,
  ToolbarContent,
  ToolbarFilter,
  ToolbarChip,
  Button,
  ButtonVariant,
  InputGroup,
  TextInput,
  ToolbarProps,
  ToolbarFilterProps,
  TextInputProps,
  Badge,
  TextInputTypes,
  InputGroupItem,
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons/dist/js/icons/search-icon';
import { FilterIcon } from '@patternfly/react-icons/dist/js/icons/filter-icon';
import type { ClusterEventsFiltersType } from '../../types';
import type {
  Cluster,
  Event,
  Host,
  Inventory,
} from '@openshift-assisted/types/assisted-installer-service';
import { EVENT_SEVERITIES } from '../../config';
import { useTranslation } from '../../hooks/use-translation-wrapper';
import { isSelectEventChecked } from './utils';
import { TFunction } from 'i18next';
import { stringToJSON } from '../../utils';
import { CustomToolbarFilter } from './CustomToolbarFilter';

export type SeverityCountsType = { [severity in Event['severity']]: number };

type ClustersListToolbarProps = {
  filters: ClusterEventsFiltersType;
  setFilters: (filters: ClusterEventsFiltersType) => void;
  cluster: Cluster;
  entityKind: 'cluster' | 'host';
  events: Event[];
  severityCounts: SeverityCountsType;
  hostId?: Host['id'];
};

const CLUSTER_LEVEL = 'cluster-level-action';
const DELETED_HOSTS = 'deleted-hosts-action';

const Placeholder = ({ text }: { text: string }) => (
  <>
    <FilterIcon /> {text}
  </>
);

const mapHosts = (hosts: Cluster['hosts']) =>
  (hosts || []).map((host) => {
    const inventory = stringToJSON<Inventory>(host.inventory) || {};
    let hostname = host.requestedHostname;
    if (inventory.hostname !== host.requestedHostname) {
      hostname += ` (${inventory.hostname || ''})`;
    }
    return {
      hostname,
      id: host.id,
    };
  });

export const getInitialClusterEventsFilters = (
  entityKind: 'cluster' | 'host',
  hostId?: Host['id'],
): ClusterEventsFiltersType => ({
  message: '',
  hostIds: entityKind === 'host' && hostId ? [hostId] : [],
  severities: [],
  clusterLevel: false,
  deletedHosts: false,
});

const mapHostsChips = (
  t: TFunction,
  filters: ClusterEventsFiltersType,
  hosts: { id: string; hostname?: string }[],
): ToolbarChip[] => {
  const chips = [
    filters.deletedHosts && { key: DELETED_HOSTS, node: t('ai:Deleted hosts') },
    filters.clusterLevel && { key: CLUSTER_LEVEL, node: t('ai:Cluster-level events') },
    ...(hosts || [])
      .filter((host) => filters.hostIds?.includes(host.id))
      .map((host): ToolbarChip => ({ key: host.id, node: host.hostname })),
  ];
  return chips.filter(Boolean) as ToolbarChip[];
};

const ClusterEventsToolbar = ({
  filters,
  setFilters,
  cluster,
  hostId,
  entityKind,
  severityCounts,
}: ClustersListToolbarProps) => {
  const { t } = useTranslation();
  const [isHostExpanded, setHostExpanded] = React.useState(false);
  const [isSeverityExpanded, setSeverityExpanded] = React.useState(false);
  const [timer, setTimer] = React.useState<ReturnType<typeof setTimeout>>();

  const [messageValue, setMessageValue] = React.useState(filters.message);

  const allHosts = React.useMemo(() => mapHosts(cluster.hosts), [cluster.hosts]);
  const onClearAllFilters: ToolbarProps['clearAllFilters'] = () => {
    setFilters(getInitialClusterEventsFilters(entityKind, hostId));
    setMessageValue('');
  };

  const onSelect = (
    type: 'hostIds' | 'severities',
    isChecked: boolean,
    value: Host['id'] | Event['severity'],
  ) => {
    const setNextSelectedValues = (
      type: 'hostIds' | 'severities',
      isChecked: boolean,
      value: Host['id'] | Event['severity'],
      filters: ClusterEventsFiltersType,
    ) => ({
      ...filters,
      [type]: isChecked
        ? [...(filters[type] || []), value]
        : filters[type]?.filter((val: string) => val !== value),
    });

    const nextFilters = setNextSelectedValues(type, isChecked, value, filters);

    setFilters(nextFilters);
  };

  const onHostToggle = () => setHostExpanded(!isHostExpanded);
  const onHostSelect = (value: string, isChecked: boolean) => {
    switch (value) {
      case DELETED_HOSTS:
        setFilters({
          ...filters,
          deletedHosts: isChecked,
        });
        break;
      case CLUSTER_LEVEL:
        setFilters({
          ...filters,
          clusterLevel: isChecked,
        });
        break;
      default:
        onSelect('hostIds', isChecked, value);
    }
  };

  const onSeverityToggle = () => setSeverityExpanded(!isSeverityExpanded);
  const onSeveritySelect = (value: string, isChecked: boolean) => {
    onSelect('severities', isChecked, value);
  };

  const onMessageChange: TextInputProps['onChange'] = (_event, message) => {
    setMessageValue(message);
    clearTimeout(timer);

    const newTimer = setTimeout(() => {
      setMessageValue(message);
      setFilters({ ...filters, message });
    }, 500);

    setTimer(newTimer);
  };

  const onDeleteChipGroup: ToolbarFilterProps['deleteChipGroup'] = (type) => {
    if (type === 'Severity') {
      setFilters({
        ...filters,
        severities: [],
      });
    } else {
      setFilters({
        ...filters,
        deletedHosts: false,
        clusterLevel: false,
        hostIds: [],
      });
    }
  };

  const getSelections = (): string[] => {
    const selections = [...(filters.hostIds || [])];
    if (filters.clusterLevel) {
      selections.push(CLUSTER_LEVEL);
    }
    if (filters.deletedHosts) {
      selections.push(DELETED_HOSTS);
    }
    return selections;
  };

  const sortedHosts = allHosts.sort((a, b) =>
    a.hostname && b.hostname && a.hostname < b.hostname ? -1 : 1,
  );

  const hostChips = mapHostsChips(t, filters, sortedHosts);

  return (
    <Toolbar
      id="clusters-events-toolbar"
      className="pf-m-toggle-group-container"
      collapseListedFiltersBreakpoint="xl"
      clearAllFilters={onClearAllFilters}
      numberOfFiltersText={(numberOfFilters) =>
        t('ai:{{count}} filter applied', { count: numberOfFilters })
      }
    >
      <ToolbarContent>
        {entityKind === 'cluster' && (
          <CustomToolbarFilter
            categoryName="Hosts"
            chips={hostChips}
            deleteChip={(_, chip) =>
              onHostSelect(typeof chip === 'string' ? chip : chip.key, false)
            }
            deleteChipGroup={onDeleteChipGroup}
          >
            <Dropdown
              isOpen={isHostExpanded}
              onSelect={(e, value) => onHostSelect(value as string, isSelectEventChecked(e))}
              onOpenChange={onHostToggle}
              toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                <MenuToggle
                  ref={toggleRef}
                  id="cluster-events-hosts-dropdown-button"
                  isFullWidth
                  onClick={onHostToggle}
                  isExpanded={isHostExpanded}
                  badge={hostChips.length && <Badge isRead>{hostChips.length}</Badge>}
                >
                  <Placeholder text="Hosts" />
                </MenuToggle>
              )}
              shouldFocusToggleOnSelect
            >
              <DropdownList>
                <DropdownItem
                  id={`checkbox-${CLUSTER_LEVEL}`}
                  hasCheckbox
                  isSelected={getSelections().includes(CLUSTER_LEVEL)}
                  key={CLUSTER_LEVEL}
                  value={CLUSTER_LEVEL}
                >
                  {t('ai:Cluster-level events')}
                </DropdownItem>
                <DropdownItem
                  id={`checkbox-${DELETED_HOSTS}`}
                  hasCheckbox
                  isSelected={getSelections().includes(DELETED_HOSTS)}
                  key={DELETED_HOSTS}
                  value={DELETED_HOSTS}
                >
                  {t('ai:Deleted hosts')}
                </DropdownItem>
                {...sortedHosts.map((host) => (
                  <DropdownItem
                    id={`checkbox-${host.id}`}
                    hasCheckbox
                    isSelected={getSelections().includes(host.id)}
                    key={host.id}
                    value={host.id}
                  >
                    {host.hostname}
                  </DropdownItem>
                ))}
              </DropdownList>
            </Dropdown>
          </CustomToolbarFilter>
        )}

        <ToolbarFilter
          chips={filters.severities?.map(
            (severity): ToolbarChip => ({
              key: severity,
              node: capitalize(severity),
            }),
          )}
          deleteChip={(_, chip) =>
            onSeveritySelect(typeof chip === 'string' ? chip : chip.key, false)
          }
          deleteChipGroup={onDeleteChipGroup}
          categoryName="Severity"
        >
          <Dropdown
            isOpen={isSeverityExpanded}
            onSelect={(event, value) =>
              onSeveritySelect(value as string, isSelectEventChecked(event))
            }
            onOpenChange={onSeverityToggle}
            toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
              <MenuToggle
                ref={toggleRef}
                id="cluster-events-severity-dropdown-button"
                isFullWidth
                onClick={onSeverityToggle}
                isExpanded={isSeverityExpanded}
                badge={
                  filters.severities?.length && <Badge isRead>{filters.severities.length}</Badge>
                }
              >
                <Placeholder text="Severity" />
              </MenuToggle>
            )}
            shouldFocusToggleOnSelect
          >
            <DropdownList>
              {EVENT_SEVERITIES.map((severity) => (
                <DropdownItem
                  data-testid={`${severity}-filter-option`}
                  hasCheckbox
                  isSelected={filters.severities?.includes(severity)}
                  key={severity}
                  value={severity}
                >
                  {capitalize(severity)} <Badge isRead>{severityCounts[severity]}</Badge>
                </DropdownItem>
              ))}
            </DropdownList>
          </Dropdown>
        </ToolbarFilter>

        <ToolbarItem>
          <InputGroup>
            <InputGroupItem isFill>
              <TextInput
                name="search-text"
                id="search-text"
                type={TextInputTypes.search}
                aria-label="text to be searched"
                onChange={onMessageChange}
                value={messageValue}
                placeholder={t('ai:Filter by text')}
              />
            </InputGroupItem>
            <InputGroupItem>
              <Button variant={ButtonVariant.control} aria-label="search text button">
                <SearchIcon />
              </Button>
            </InputGroupItem>
          </InputGroup>
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );
};

export default ClusterEventsToolbar;
