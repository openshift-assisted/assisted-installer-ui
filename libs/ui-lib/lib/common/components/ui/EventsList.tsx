import React from 'react';
import { Button, ButtonVariant, Label } from '@patternfly/react-core';
import { Table, TableText, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { InfoCircleIcon } from '@patternfly/react-icons/dist/js/icons/info-circle-icon';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { SearchIcon } from '@patternfly/react-icons/dist/js/icons/search-icon';
import { Event, EventList } from '@openshift-assisted/types/assisted-installer-service';
import { EmptyState } from './uiState';
import { getHumanizedDateTime } from './utils';
import { useTranslation } from '../../hooks/use-translation-wrapper';

const getEventRowKey = (event: Event) => event.eventTime + event.message;

const getLabelColor = (severity: Event['severity']) => {
  switch (severity) {
    case 'info':
      return 'blue';
    case 'warning':
      return 'orange';
    case 'error':
      return 'red';
    case 'critical':
      return 'purple';
  }
};

const getLabelIcon = (severity: Event['severity']) => {
  switch (severity) {
    case 'info':
      return <InfoCircleIcon />;
    case 'warning':
      return <ExclamationTriangleIcon />;
    case 'error':
    case 'critical':
      return <ExclamationCircleIcon />;
  }
};

export type EventsListProps = {
  events: EventList;
  resetFilters: () => void;
};

const EventsList = ({ events, resetFilters }: EventsListProps) => {
  const { t } = useTranslation();
  if (events.length === 0) {
    return (
      <EmptyState
        icon={SearchIcon}
        title={t('ai:No matching events')}
        content={t(
          'ai:There are no events that match the current filters. Adjust or clear the filters to view events.',
        )}
        primaryAction={
          <Button
            variant={ButtonVariant.primary}
            onClick={resetFilters}
            id="empty-state-cluster-events-clear-filters-button"
            data-ouia-id="button-clear-events-filter"
          >
            {t('ai:Clear filters')}
          </Button>
        }
      />
    );
  }

  const rows = events.map((event) => ({
    cells: [
      {
        title: (
          <TableText wrapModifier="fitContent" cellPadding={0}>
            <strong>{getHumanizedDateTime(event.eventTime)}</strong>
          </TableText>
        ),
      },
      {
        title: (
          <TableText wrapModifier="breakWord">
            {event.severity !== 'info' && (
              <>
                <Label color={getLabelColor(event.severity)} icon={getLabelIcon(event.severity)}>
                  {event.severity}
                </Label>{' '}
              </>
            )}
            {event.message.replace(/\\n/, ' ')}
          </TableText>
        ),
      },
    ],
    props: { event },
  }));

  return (
    <Table variant={TableVariant.compact} aria-label={t('ai:Events table')} borders={false}>
      <Thead>
        <Tr>
          <Th>
            <TableText wrapModifier="fitContent" cellPadding={0}>
              {t('ai:Time')}
            </TableText>
          </Th>
          <Th>
            <TableText wrapModifier="breakWord">{t('ai:Message')}</TableText>
          </Th>
        </Tr>
      </Thead>
      <Tbody>
        {rows.map((row, i) => (
          <Tr key={getEventRowKey(row.props.event)}>
            {row.cells.map((cell, j) => (
              <Td key={`cell-${i}-${j}`}>{cell.title}</Td>
            ))}
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default EventsList;
