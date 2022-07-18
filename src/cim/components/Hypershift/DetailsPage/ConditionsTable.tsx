import { Flex, FlexItem } from '@patternfly/react-core';
import { CheckCircleIcon, ExclamationCircleIcon, UnknownIcon } from '@patternfly/react-icons';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import {
  global_palette_green_500 as okColor,
  global_danger_color_100 as dangerColor,
} from '@patternfly/react-tokens';
import * as React from 'react';
import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';

type ConditionsTableProps = {
  conditions?: {
    status: string;
    type: string;
    message: string;
  }[];
};

const ConditionsTable = ({ conditions }: ConditionsTableProps) => {
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
        {conditions?.map((c) => {
          let icon = <UnknownIcon />;
          if (c.status === 'True') {
            icon = <CheckCircleIcon color={okColor.value} />;
          } else if (c.status === 'False') {
            icon = <ExclamationCircleIcon color={dangerColor.value} size="sm" />;
          }
          return (
            <Tr key={c.type}>
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
