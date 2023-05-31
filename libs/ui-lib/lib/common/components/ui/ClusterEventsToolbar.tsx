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
  Select,
  SelectOption,
  TextInput,
  ToolbarProps,
  ToolbarFilterProps,
  SelectProps,
  TextInputProps,
  Badge,
  TextInputTypes,
} from '@patternfly/react-core';
import { SearchIcon, FilterIcon } from '@patternfly/react-icons';
import { ClusterEventsFiltersType } from '../../types';
import { Cluster, Event, Host, Inventory, stringToJSON } from '../../api';
import { EVENT_SEVERITIES } from '../../config';
import { useTranslation } from '../../hooks/use-translation-wrapper';
import { isSelectEventChecked } from './utils';
import { TFunction } from 'i18next';

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

  const onHostToggle: SelectProps['onToggle'] = () => setHostExpanded(!isHostExpanded);
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

  const onSeverityToggle: SelectProps['onToggle'] = () => setSeverityExpanded(!isSeverityExpanded);
  const onSeveritySelect = (value: string, isChecked: boolean) => {
    onSelect('severities', isChecked, value);
  };

  const onMessageChange: TextInputProps['onChange'] = (message) => {
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
          <ToolbarFilter
            categoryName="Hosts"
            chips={hostChips}
            deleteChip={(_, chip) =>
              onHostSelect(typeof chip === 'string' ? chip : chip.key, false)
            }
            deleteChipGroup={onDeleteChipGroup}
          >
            <Select
              variant="checkbox"
              aria-label="hosts"
              toggleId="cluster-events-hosts-dropdown-button"
              onToggle={onHostToggle}
              onSelect={(e, value) => onHostSelect(value as string, isSelectEventChecked(e))}
              selections={getSelections()}
              customBadgeText={hostChips.length}
              isOpen={isHostExpanded}
              placeholderText={<Placeholder text="Hosts" />}
              isDisabled={allHosts.length === 0}
              maxHeight={280}
              zIndex={600}
            >
              {[
                <SelectOption
                  inputId={`checkbox-${CLUSTER_LEVEL}`}
                  key={CLUSTER_LEVEL}
                  value={CLUSTER_LEVEL}
                >
                  {t('ai:Cluster-level events')}
                </SelectOption>,
                <SelectOption
                  inputId={`checkbox-${DELETED_HOSTS}`}
                  key={DELETED_HOSTS}
                  value={DELETED_HOSTS}
                >
                  {t('ai:Deleted hosts')}
                </SelectOption>,
                ...sortedHosts.map((host) => (
                  <SelectOption key={host.id} value={host.id}>
                    {host.hostname}
                  </SelectOption>
                )),
              ]}
            </Select>
          </ToolbarFilter>
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
          <Select
            variant="checkbox"
            aria-label="Severity"
            toggleId="cluster-events-severity-dropdown-button"
            onToggle={onSeverityToggle}
            onSelect={(event, value) =>
              onSeveritySelect(value as string, isSelectEventChecked(event))
            }
            selections={filters.severities}
            isOpen={isSeverityExpanded}
            placeholderText={<Placeholder text="Severity" />}
          >
            {EVENT_SEVERITIES.map((severity) => (
              <SelectOption
                data-testid={`${severity}-filter-option`}
                key={severity}
                value={severity}
              >
                {capitalize(severity)} <Badge isRead>{severityCounts[severity]}</Badge>
              </SelectOption>
            ))}
          </Select>
        </ToolbarFilter>

        <ToolbarItem>
          <InputGroup>
            <TextInput
              name="search-text"
              id="search-text"
              type={TextInputTypes.search}
              aria-label="text to be searched"
              onChange={onMessageChange}
              value={messageValue}
              placeholder={t('ai:Filter by text')}
            />
            <Button variant={ButtonVariant.control} aria-label="search text button">
              <SearchIcon />
            </Button>
          </InputGroup>
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );
};

export default ClusterEventsToolbar;
