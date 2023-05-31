import React from 'react';
import { Button, ButtonVariant, Label } from '@patternfly/react-core';
import { TableVariant, Table, TableBody, breakWord } from '@patternfly/react-table';
import {
  InfoCircleIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  SearchIcon,
} from '@patternfly/react-icons';
import { ExtraParamsType } from '@patternfly/react-table/dist/js/components/Table/base';
import { Event, EventList } from '../../api';
import { EmptyState } from './uiState';
import { getHumanizedDateTime } from './utils';
import { fitContent, noPadding } from './table';
import { useTranslation } from '../../hooks/use-translation-wrapper';

const getEventRowKey = ({ rowData }: ExtraParamsType) =>
  // eslint-disable-next-line
  rowData?.props?.event.eventTime + rowData?.props?.event.message;

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
        title: <strong>{getHumanizedDateTime(event.eventTime)}</strong>,
      },
      {
        title: (
          <>
            {event.severity !== 'info' && (
              <>
                <Label color={getLabelColor(event.severity)} icon={getLabelIcon(event.severity)}>
                  {event.severity}
                </Label>{' '}
              </>
            )}
            {event.message}
          </>
        ),
      },
    ],
    props: { event },
  }));

  return (
    <Table
      rows={rows}
      cells={[
        { title: t('ai:Time'), cellTransforms: [fitContent, noPadding] },
        { title: t('ai:Message'), cellTransforms: [breakWord] },
      ]}
      variant={TableVariant.compact}
      aria-label={t('ai:Events table')}
      borders={false}
    >
      <TableBody rowKey={getEventRowKey} />
    </Table>
  );
};

export default EventsList;
