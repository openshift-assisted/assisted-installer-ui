import React, { ReactChild, ReactNode } from 'react';
import {
  Content,
  ContentVariants,
  ContentProps,
} from '@patternfly/react-core';
import { WithTestID } from '../../types';

import './DetailList.css';
import { RenderIf } from './RenderIf';

export type DetailListProps = {
  children: ReactChild | (ReactChild | undefined)[];
  title?: string;
  titleComponent?: ContentProps['component'];
};

export type DetailItemList = {
  title: string;
  value?: string;
}[];

export type DetailItemProps = {
  title?: string | ReactNode;
  value?: DetailItemList | React.ReactNode;
  idPrefix?: string;
  isHidden?: boolean;
  classNameValue?: string;
};

export const DetailList: React.FC<DetailListProps> = ({
  children,
  title,
  titleComponent = 'h2',
}) => (
  <Content>
    {title && <Content component={titleComponent}>{title}</Content>}
    <Content component={ContentVariants.dl} className="detail-list">
      {children}
    </Content>
  </Content>
);

const hasDetailItemList = (data: DetailItemProps['value']): data is DetailItemList => {
  return Array.isArray(data);
};

export const DetailItem: React.FC<DetailItemProps & WithTestID> = ({
  title,
  value = '',
  idPrefix,
  testId,
  isHidden = false,
  classNameValue,
}) =>
  isHidden ? null : (
    <>
      <RenderIf condition={title !== undefined}>
        <Content
          component={ContentVariants.dt}
          id={idPrefix ? `${idPrefix}-title` : undefined}
          data-testid={testId ? `${testId}-title` : undefined}
        >
          {title}
        </Content>
      </RenderIf>
      <Content
        component={ContentVariants.dd}
        id={idPrefix ? `${idPrefix}-value` : undefined}
        data-testid={testId ? `${testId}-value` : undefined}
        className={classNameValue}
      >
        {hasDetailItemList(value) ? (
          <Content component={ContentVariants.dl}>
            {value.map((item, idx) => [
              <Content
                data-testid={testId ? `${testId}-title-${idx}` : undefined}
                key={item.title}
                component={ContentVariants.dt}
              >
                {item.title}
              </Content>,
              <Content
                data-testid={testId ? `${testId}-value-${idx}` : undefined}
                key={`dd-${item.title}`}
                component={ContentVariants.dd}
              >
                {item.value}
              </Content>,
            ])}
          </Content>
        ) : (
          value
        )}
      </Content>
    </>
  );
