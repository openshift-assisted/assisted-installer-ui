import React from 'react';
import { Button, ButtonVariant, List, ListItem, Popover } from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InProgressIcon,
  PendingIcon,
} from '@patternfly/react-icons';
import {
  global_danger_color_100 as dangerColor,
  global_success_color_100 as okColor,
} from '@patternfly/react-tokens';
import { pluralize } from 'humanize-plus';
import { TFunction } from 'i18next';
import { MonitoredOperatorsList, OperatorStatus } from '../../api';
import { operatorLabels, OperatorName } from '../../config';
import ClusterProgressItem from './ClusterProgressItem';
import { useTranslation } from '../../hooks/use-translation-wrapper';

import './OperatorsProgressItem.css';

export function getAggregatedStatus(operators: MonitoredOperatorsList) {
  const operatorStates: (OperatorStatus | 'pending')[] = operators.map(
    (operator) => operator.status || 'pending',
  );
  if (operatorStates.includes('failed')) return 'failed';
  if (operatorStates.includes('progressing')) return 'progressing';
  if (operatorStates.includes('pending')) return 'pending';
  return 'available';
}

export const getOperatorCountString = (count: number) => `${count} ${pluralize(count, 'operator')}`;

export function getOperatorsLabel(operators: MonitoredOperatorsList, t: TFunction) {
  const failedOperatorsCount = operators.filter((o) => o.status === 'failed').length;
  const status = getAggregatedStatus(operators);
  const operatorsCountString = getOperatorCountString(operators.length);

  switch (status) {
    case 'available':
      return t('ai:{{operatorsCountString}} installed', {
        operatorsCountString: operatorsCountString,
      });
    case 'failed':
      return operators.length > 1
        ? `${failedOperatorsCount}/${operatorsCountString} failed`
        : `${getOperatorCountString(failedOperatorsCount)} failed`;
    case 'progressing':
      return t('ai:Installing {{operatorsCountString}}', {
        operatorsCountString: operatorsCountString,
      });

    default:
      return t('ai:Pending - {{operatorsCountString}}', {
        operatorsCountString: operatorsCountString,
      });
  }
}

export function getOperatorsIcon(status: OperatorStatus | 'pending') {
  switch (status) {
    case 'available':
      return <CheckCircleIcon color={okColor.value} />;
    case 'failed':
      return <ExclamationCircleIcon color={dangerColor.value} />;
    case 'progressing':
      return <InProgressIcon />;
    default:
      return <PendingIcon />;
  }
}

type OperatorListProps = {
  operators: MonitoredOperatorsList;
};

type OperatorsPopoverProps = OperatorListProps & {
  children: React.ComponentProps<typeof Popover>['children'];
};

const OperatorsPopover = ({ operators, children }: OperatorsPopoverProps) => {
  const { t } = useTranslation();
  return (
    <Popover
      headerContent={<div>{t('ai:Operators')}</div>}
      bodyContent={
        <List className="operators-progress-item__operators-list">
          {operators.map((operator) => {
            let status = operator.status ?? 'pending';
            if (operator.status === 'available') {
              status = 'installed';
            }
            const operatorName = operator.name as OperatorName;
            const name = operatorLabels(t)[operatorName] || operator.name;
            return (
              <ListItem key={operator.name} title={operator.statusInfo}>
                {name} {status}
              </ListItem>
            );
          })}
        </List>
      }
      minWidth="30rem"
      maxWidth="50rem"
    >
      {children}
    </Popover>
  );
};

const OperatorsProgressItem = ({ operators }: OperatorListProps) => {
  const { t } = useTranslation();
  const icon = getOperatorsIcon(getAggregatedStatus(operators));
  const label = getOperatorsLabel(operators, t);
  return (
    <ClusterProgressItem icon={icon}>
      <>
        <OperatorsPopover operators={operators}>
          <Button variant={ButtonVariant.link} isInline data-testid="operators-progress-item">
            {t('ai:Operators')}
          </Button>
        </OperatorsPopover>
        <small>{label}</small>
      </>
    </ClusterProgressItem>
  );
};

export default OperatorsProgressItem;
