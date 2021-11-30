import React from 'react';
import * as _ from 'lodash';
import {
  Table,
  TableHeader,
  TableBody,
  TableVariant,
  IRow,
  SortByDirection,
  ISortBy,
  OnSort,
  RowWrapperProps,
  RowWrapper,
  ICell,
  IAction,
  ISeparator,
} from '@patternfly/react-table';
import { ExtraParamsType } from '@patternfly/react-table/dist/js/components/Table/base';
import { Checkbox } from '@patternfly/react-core';
import classnames from 'classnames';
import { getColSpanRow, rowSorter } from '../ui/table/utils';
import { WithTestID } from '../../types';

import './HostsTable.css';

type OpenRows = {
  [id: string]: boolean;
};

const rowKey = ({ rowData }: ExtraParamsType) => rowData?.key;

const HostsTableRowWrapper = (props: RowWrapperProps) => (
  <RowWrapper {...props} data-testid={`host-row-${props.rowProps?.rowIndex}`} />
);

export type TableRow<R> = {
  header: ICell | string;
  // eslint-disable-next-line
  cell?: (obj: R) => { title: React.ReactNode; props: any; sortableValue?: string | number };
};

export type ActionsResolver<R> = (obj: R) => (IAction | ISeparator)[];
export type ExpandComponentProps<R> = {
  obj: R;
  showNTP?: boolean;
};

type HostsTable<R> = {
  data: R[];
  content: TableRow<R>[];
  ExpandComponent: React.ComponentType<ExpandComponentProps<R>>;
  children: React.ReactNode;
  getDataId: (obj: R) => string;
  onSelect?: (obj: R, isSelected: boolean) => void;
  selectedIDs?: string[];
  className?: string;
  actionResolver?: ActionsResolver<R>;
};

// eslint-disable-next-line
const AITable = <R extends any>({
  data,
  testId = 'hosts-table',
  className,
  content,
  ExpandComponent,
  getDataId,
  actionResolver,
  onSelect,
  children,
  selectedIDs,
}: WithTestID & HostsTable<R>) => {
  const [openRows, setOpenRows] = React.useState<OpenRows>({});
  const [sortBy, setSortBy] = React.useState<ISortBy>({
    index: 1, // Hostname-column
    direction: SortByDirection.asc,
  });

  let contentWithAdditions: TableRow<R>[] = content;
  if (onSelect) {
    contentWithAdditions = [
      {
        header: {
          title: '', // No readable title above a checkbox
          cellFormatters: [],
        },
        cell: (obj) => {
          const id = getDataId(obj);
          const isChecked = selectedIDs?.includes(id);
          const selectId = `select-${id}`;
          return {
            title: (
              <Checkbox
                id={selectId}
                onChange={() => onSelect(obj, !isChecked)}
                isChecked={isChecked}
              />
            ),
            props: { 'data-testid': selectId },
          };
        },
      },
      ...content,
    ];
  }

  const columns = contentWithAdditions.map((c) => c.header);
  const hostRows = _.flatten(
    (data || [])
      .map((obj) => {
        const id = getDataId(obj);
        const cells = contentWithAdditions.filter((c) => !!c.cell).map((c) => c.cell?.(obj));
        return [
          {
            // visible row
            isOpen: !!openRows[id],
            cells,
            key: `${id}-master`,
            obj,
            id,
          },
          {
            // expandable detail
            // parent will be set after sorting
            fullWidth: true,
            cells: [
              {
                title: <ExpandComponent obj={obj} />,
              },
            ],
            key: `${id}-detail`,
          },
        ];
      })
      .sort(rowSorter(sortBy, (row: IRow, index = 1) => row[0].cells[index - 1]))
      .map((row: IRow, index: number) => {
        row[1].parent = index * 2;
        return row;
      }),
  );

  const rows = React.useMemo(() => {
    if (hostRows.length) {
      return hostRows;
    }
    return getColSpanRow(children, columns.length);
  }, [hostRows, columns, children]);

  const onCollapse = React.useCallback(
    (_event, rowKey) => {
      const id = hostRows[rowKey].id;
      if (id) {
        setOpenRows(Object.assign({}, openRows, { [id]: !openRows[id] }));
      }
    },
    [hostRows, openRows],
  );

  const onSort: OnSort = React.useCallback(
    (_event, index, direction) => {
      setOpenRows({}); // collapse all
      setSortBy({
        index,
        direction,
      });
    },
    [setSortBy, setOpenRows],
  );

  const tableActionResolver = React.useCallback(
    (rowData) => actionResolver?.(rowData.obj as R) as (IAction | ISeparator)[],
    [actionResolver],
  );

  return (
    <Table
      rows={rows}
      cells={columns}
      onCollapse={onCollapse}
      variant={TableVariant.compact}
      aria-label="Hosts table"
      className={classnames(className, 'hosts-table')}
      sortBy={sortBy}
      onSort={onSort}
      rowWrapper={HostsTableRowWrapper}
      data-testid={testId}
      actionResolver={actionResolver ? tableActionResolver : undefined}
    >
      <TableHeader />
      <TableBody rowKey={rowKey} />
    </Table>
  );
};

export default AITable;
