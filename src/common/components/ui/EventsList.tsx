import React from 'react';
import { Label } from '@patternfly/react-core';
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
  // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
  rowData?.props?.event.sortableTime + rowData?.props?.event.message;

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
  className?: string;
};

const EventsList: React.FC<EventsListProps> = ({ events, className }) => {
  const { t } = useTranslation();
  if (events.length === 0) {
    return (
      <EmptyState
        icon={SearchIcon}
        title={t('ai:No events found')}
        content={t('ai:There are no events found.')}
      />
    );
  }

  // Do not memoize result to keep it recomputed since we use "relative" time bellow
  const sortedEvents = events
    .map((event) => ({
      ...event,
      sortableTime: new Date(event.eventTime).getTime(),
    }))
    .sort(
      // Descending order
      (a, b) => b.sortableTime - a.sortableTime,
    );

  const rows = sortedEvents.map((event) => ({
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
    <div className={className}>
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
    </div>
  );
};

export default EventsList;
