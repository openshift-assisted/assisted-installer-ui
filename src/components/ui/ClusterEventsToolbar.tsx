import React from 'react';
import _ from 'lodash';
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
} from '@patternfly/react-core';
import { SearchIcon, FilterIcon } from '@patternfly/react-icons';
import { Host, Event, Cluster, Inventory } from '../../api/types';
import { stringToJSON } from '../../api/utils';
import { EVENT_SEVERITIES } from '../../config';

import './ClusterEventsToolbar.css';

export type ClusterEventsFiltersType = {
  fulltext: string;
  hosts: Host['id'][];
  severity: Event['severity'][];
};

type ClustersFilterToolbarProps = {
  filters: ClusterEventsFiltersType;
  setFilters: (filters: ClusterEventsFiltersType) => void;
  cluster: Cluster;
};

const Placeholder = ({ text }: { text: string }) => (
  <>
    <FilterIcon /> {text}
  </>
);

export const NO_HOSTS = 'deselect-all-hosts-action';

const mapHosts = (hosts: Host[] = []) =>
  hosts.map((host) => {
    const inventory = stringToJSON<Inventory>(host.inventory) || {};
    let hostname = host.requestedHostname;
    if (inventory.hostname !== host.requestedHostname) {
      hostname += ` (${inventory.hostname})`;
    }
    return {
      hostname,
      id: host.id,
    };
  });

export const getInitialClusterEventsFilters = (cluster: Cluster): ClusterEventsFiltersType => ({
  fulltext: '',
  hosts: mapHosts(cluster.hosts).map((host) => host.id),
  severity: EVENT_SEVERITIES,
});

const ClusterEventsToolbar: React.FC<ClustersFilterToolbarProps> = ({
  filters,
  setFilters,
  cluster,
}) => {
  const [isHostExpanded, setHostExpanded] = React.useState(false);
  const [isSeverityExpanded, setSeverityExpanded] = React.useState(false);

  const allHosts = React.useMemo(() => mapHosts(cluster.hosts), [cluster.hosts]);
  const onClearAllFilters: ToolbarProps['clearAllFilters'] = () => {
    setFilters(getInitialClusterEventsFilters(cluster));
  };

  const onSelect = (type: 'hosts' | 'severity', isChecked: boolean, value: Host['id']) => {
    setFilters({
      ...filters,
      [type]: isChecked
        ? [...filters[type], value]
        : [...filters[type].filter((v: string) => v !== value)],
    });
  };

  const onHostToggle: SelectProps['onToggle'] = () => setHostExpanded(!isHostExpanded);
  const onHostSelect: SelectProps['onSelect'] = (event, value) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    const isChecked = event.target.checked;

    if (value === NO_HOSTS) {
      setFilters({
        ...filters,
        hosts: [], // clear all selection whenever clicked
      });
    } else {
      onSelect('hosts', isChecked, value as string);
    }
  };

  const onSeverityToggle: SelectProps['onToggle'] = () => setSeverityExpanded(!isSeverityExpanded);
  const onSeveritySelect: SelectProps['onSelect'] = (event, value) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    onSelect('severity', event.target.checked, value as string);
  };

  const onFulltextChange: TextInputProps['onChange'] = (fulltext) => {
    setFilters({
      ...filters,
      fulltext,
    });
  };

  const onDeleteChip: ToolbarFilterProps['deleteChip'] = (type, chip) => {
    if (type) {
      const id = chip['key'] || chip;
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
      id="clusters-events-toolbar"
      className="pf-m-toggle-group-container"
      collapseListedFiltersBreakpoint="xl"
      clearAllFilters={onClearAllFilters}
    >
      <ToolbarContent>
        <ToolbarFilter categoryName="hosts">
          <Select
            variant="checkbox"
            aria-label="hosts"
            onToggle={onHostToggle}
            onSelect={onHostSelect}
            selections={filters.hosts}
            isOpen={isHostExpanded}
            placeholderText={<Placeholder text="Hosts" />}
            isDisabled={allHosts.length === 0}
          >
            {[
              <SelectOption key={NO_HOSTS} value={NO_HOSTS}>
                Clear selection
              </SelectOption>,
              ...allHosts.map((host) => (
                <SelectOption key={host.id} value={host.id}>
                  {host.hostname}
                </SelectOption>
              )),
            ]}
          </Select>
        </ToolbarFilter>

        <ToolbarFilter
          chips={filters.severity.map(
            (severity): ToolbarChip => ({
              key: severity,
              node: _.capitalize(severity),
            }),
          )}
          deleteChip={onDeleteChip}
          deleteChipGroup={onDeleteChipGroup}
          categoryName="severity"
        >
          <Select
            variant="checkbox"
            aria-label="Severity"
            onToggle={onSeverityToggle}
            onSelect={onSeveritySelect}
            selections={filters.severity}
            isOpen={isSeverityExpanded}
            placeholderText={<Placeholder text="Severity" />}
          >
            {EVENT_SEVERITIES.map((severity) => (
              <SelectOption key={severity} value={severity}>
                {_.capitalize(severity)}
              </SelectOption>
            ))}
          </Select>
        </ToolbarFilter>

        <ToolbarItem>
          <InputGroup>
            <TextInput
              name="search-text"
              id="search-text"
              type="search"
              aria-label="text to be searched"
              onChange={onFulltextChange}
              value={filters.fulltext}
              placeholder="Filter by text ..."
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
