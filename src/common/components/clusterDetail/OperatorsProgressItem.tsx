import React from 'react';
import {
  Button,
  ButtonVariant,
  Stack,
  StackItem,
  List,
  ListItem,
  Popover,
} from '@patternfly/react-core';
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
import { MonitoredOperatorsList, OperatorStatus } from '../../api/types';
import { OPERATOR_LABELS } from '../../config';
import BorderedIcon from '../ui/BorderedIcon/BorderedIcon';

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

export function getOperatorsLabel(operators: MonitoredOperatorsList) {
  const failedOperatorsCount = operators.filter((o) => o.status === 'failed').length;
  const status = getAggregatedStatus(operators);
  const operatorsCountString = getOperatorCountString(operators.length);
  switch (status) {
    case 'available':
      return `${operatorsCountString} installed`;
    case 'failed':
      return operators.length > 1
        ? `${failedOperatorsCount}/${operatorsCountString} failed`
        : `${getOperatorCountString(failedOperatorsCount)} failed`;
    case 'progressing':
      return `Installing ${operatorsCountString}`;
    default:
      return `Pending - ${operatorsCountString}`;
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

type OperatorsPopoverProps = {
  operators: MonitoredOperatorsList;
  children: React.ComponentProps<typeof Popover>['children'];
};

const OperatorsPopover: React.FC<OperatorsPopoverProps> = ({ operators, children }) => {
  return (
    <Popover
      headerContent={<div>Operators</div>}
      bodyContent={
        <List className="operators-progress-item__operators-list">
          {operators.map((operator) => {
            const status = operator.status || 'pending';
            const name = operator.name && OPERATOR_LABELS[operator.name];
            return (
              <ListItem key={operator.name} title={operator.statusInfo}>
                {name} {status}.
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

type OperatorsProgressItemProps = {
  operators: MonitoredOperatorsList;
};

const OperatorsProgressItem: React.FC<OperatorsProgressItemProps> = ({ operators }) => {
  const icon = getOperatorsIcon(getAggregatedStatus(operators));
  const label = getOperatorsLabel(operators);

  return (
    <Stack hasGutter>
      <StackItem>
        <BorderedIcon>{icon}</BorderedIcon>
      </StackItem>
      <StackItem>
        <OperatorsPopover operators={operators}>
          <Button variant={ButtonVariant.link} isInline data-testid="operators-progress-item">
            Operators
          </Button>
        </OperatorsPopover>
      </StackItem>
      {label}
    </Stack>
  );
};

export default OperatorsProgressItem;
