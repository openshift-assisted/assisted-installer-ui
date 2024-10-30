import React from 'react';
import {
  ActionsColumn,
  ExpandableRowContent,
  IAction,
  InnerScrollContainer,
  ISeparator,
  ISortBy,
  OnCollapse,
  OnSort,
  Table,
  TableProps,
  Tbody,
  Td,
  TdProps,
  Th,
  Thead,
  ThProps,
  Tr,
} from '@patternfly/react-table';
import classnames from 'classnames';

import { WithTestID } from '../../types';
import './HostsTable.css';

export type ActionsResolver<R> = (obj: R) => (IAction | ISeparator)[];

type TableMemoRowType = {
  cells: { title: string | React.ReactNode; props?: Omit<TdProps, 'ref'> }[];
  actions: IAction[];
  nestedComponent?: React.ReactNode;
  isOpen?: boolean;
};

export type TableMemoColType = {
  title: string | React.ReactNode;
  props?: Omit<ThProps, 'ref'>;
  sort?: boolean;
};

export type TableMemoProps = {
  rows: TableMemoRowType[];
  cols: TableMemoColType[];
  sortBy: ISortBy;
  onSort: OnSort;
  onCollapse?: OnCollapse;
  className: TableProps['className'];
  variant?: TableProps['variant'];
} & WithTestID;

export const AITableMemo = React.memo(
  ({ rows, cols, onCollapse, className, variant, onSort, sortBy, testId }: TableMemoProps) => {
    const getSortParams = (columnIndex: number): ThProps['sort'] => ({
      sortBy,
      onSort,
      columnIndex,
    });

    return (
      <InnerScrollContainer>
        <Table
          aria-label="Hosts table"
          className={classnames(className, 'hosts-table')}
          data-testid={testId}
          variant={variant}
        >
          <Thead>
            <Tr>
              {onCollapse && <Th />}
              {cols.map((col, i) => (
                <Th key={`col-${i}`} {...col.props} sort={col.sort ? getSortParams(i) : undefined}>
                  {col.title}
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {rows.map((row, i) => (
              <React.Fragment key={`row-wrapper-${i}`}>
                <Tr key={`row-${i}`} data-testid={`host-row-${Number(i)}`}>
                  {row.nestedComponent && (
                    <Td
                      expand={{
                        rowIndex: i,
                        isExpanded: !!row.isOpen,
                        onToggle: onCollapse as OnCollapse,
                      }}
                    />
                  )}

                  {row.cells.map((cell, j) => (
                    <Td key={`cell-${i}-${j}`} {...cell.props}>
                      {cell.title}
                    </Td>
                  ))}

                  {row.actions && (
                    <Td isActionCell>
                      <ActionsColumn
                        items={row.actions}
                        popperProps={{ appendTo: () => document.body, position: 'end' }}
                      />
                    </Td>
                  )}
                </Tr>

                {row.nestedComponent && (
                  <Tr key={`nested-row-${i}`} isExpanded={row.isOpen}>
                    <Td colSpan={Object.keys(cols).length + 1}>
                      <ExpandableRowContent>{row.nestedComponent}</ExpandableRowContent>
                    </Td>
                  </Tr>
                )}
              </React.Fragment>
            ))}
          </Tbody>
        </Table>
      </InnerScrollContainer>
    );
  },
);

AITableMemo.displayName = 'tableMemo';
