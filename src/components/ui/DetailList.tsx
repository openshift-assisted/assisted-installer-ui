import React, { ReactChild } from 'react';
import {
  TextContent,
  TextList,
  TextListVariants,
  TextListItem,
  TextListItemVariants,
  Text,
  TextProps,
} from '@patternfly/react-core';

import './DetailList.css';

export type DetailListProps = {
  children: ReactChild | (ReactChild | undefined)[];
  title?: string;
  titleComponent?: TextProps['component'];
};

export type DetailItemProps = {
  title: string;
  value?:
    | {
        title: string;
        value?: string;
      }[]
    | React.ReactNode;
  idPrefix?: string;
};

export const DetailList: React.FC<DetailListProps> = ({
  children,
  title,
  titleComponent = 'h2',
}) => (
  <TextContent>
    {title && <Text component={titleComponent}>{title}</Text>}
    <TextList component={TextListVariants.dl} className="detail-list">
      {children}
    </TextList>
  </TextContent>
);

export const DetailItem: React.FC<DetailItemProps> = ({ title, value = '', idPrefix }) => (
  <>
    <TextListItem
      component={TextListItemVariants.dt}
      id={idPrefix ? `${idPrefix}-title` : undefined}
    >
      {title}
    </TextListItem>
    <TextListItem
      component={TextListItemVariants.dd}
      id={idPrefix ? `${idPrefix}-value` : undefined}
    >
      {Array.isArray(value) ? (
        <TextList component={TextListVariants.dl}>
          {value.map((item) => [
            <TextListItem key={item.title} component={TextListItemVariants.dt}>
              {item.title}
            </TextListItem>,
            <TextListItem key={`dd-${item.title}`} component={TextListItemVariants.dd}>
              {item.value}
            </TextListItem>,
          ])}
        </TextList>
      ) : (
        value
      )}
    </TextListItem>
  </>
);
