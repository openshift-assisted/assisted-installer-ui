import { Flex, FlexItem } from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InProgressIcon,
  UnknownIcon,
} from '@patternfly/react-icons';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import {
  global_palette_green_500 as okColor,
  global_danger_color_100 as dangerColor,
} from '@patternfly/react-tokens';
import * as React from 'react';
import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';

import './ConditionsTable.css';

const ignoredConditions = ['Progressing'];
const reversedConditions = ['Degraded'];

type ConditionsTableProps = {
  conditions?: {
    status: string;
    type: string;
    message: string;
  }[];
  isDone: boolean;
};

const ConditionsTable = ({ conditions, isDone }: ConditionsTableProps) => {
  const { t } = useTranslation();
  return (
    <TableComposable variant="compact">
      <Thead>
        <Tr>
          <Th width={25}>{t('ai:Condition')}</Th>
          <Th>{t('ai:Message')}</Th>
        </Tr>
      </Thead>
      <Tbody>
        {conditions
          ?.filter(({ type }) => !ignoredConditions.includes(type))
          .map((c) => {
            let icon = <UnknownIcon />;

            const { okStatus, nokStatus } = reversedConditions.includes(c.type)
              ? { okStatus: 'False', nokStatus: 'True' }
              : { okStatus: 'True', nokStatus: 'False' };

            if (c.status === okStatus) {
              icon = <CheckCircleIcon color={okColor.value} />;
            } else if (c.status === nokStatus) {
              icon = isDone ? (
                <ExclamationCircleIcon color={dangerColor.value} size="sm" />
              ) : (
                <InProgressIcon />
              );
            }
            return (
              <Tr key={c.type} className="ai-conditions-table__no-border">
                <Td>
                  <Flex
                    alignItems={{ default: 'alignItemsCenter' }}
                    spaceItems={{ default: 'spaceItemsXs' }}
                  >
                    <FlexItem>{icon}</FlexItem>
                    <FlexItem>{c.type}</FlexItem>
                  </Flex>
                </Td>
                <Td span={8}>{c.message}</Td>
              </Tr>
            );
          })}
      </Tbody>
    </TableComposable>
  );
};

export default ConditionsTable;
