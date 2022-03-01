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
  TableProps,
} from '@patternfly/react-table';
import { ExtraParamsType } from '@patternfly/react-table/dist/js/components/Table/base';
import { Checkbox } from '@patternfly/react-core';
import classnames from 'classnames';
import { getColSpanRow, rowSorter } from '../ui/table/utils';
import { WithTestID } from '../../types';

import './HostsTable.css';

const rowKey = ({ rowData }: ExtraParamsType) => rowData?.key;

type TableMemoProps = {
  rows: TableProps['rows'];
  cells: TableProps['cells'];
  onCollapse: TableProps['onCollapse'];
  className: TableProps['className'];
  sortBy: TableProps['sortBy'];
  onSort: TableProps['onSort'];
  rowWrapper: TableProps['rowWrapper'];
  // eslint-disable-next-line
  actionResolver?: ActionsResolver<any>;
};

const TableMemo: React.FC<WithTestID & TableMemoProps> = React.memo(
  ({ rows, cells, onCollapse, className, sortBy, onSort, rowWrapper, testId, actionResolver }) => {
    const tableActionResolver = React.useCallback(
      (rowData) => actionResolver?.(rowData.obj) as (IAction | ISeparator)[],
      [actionResolver],
    );
    return (
      <Table
        rows={rows}
        cells={cells}
        onCollapse={onCollapse}
        variant={TableVariant.compact}
        aria-label="Hosts table"
        className={classnames(className, 'hosts-table')}
        sortBy={sortBy}
        onSort={onSort}
        rowWrapper={rowWrapper}
        data-testid={testId}
        actionResolver={actionResolver ? tableActionResolver : undefined}
      >
        <TableHeader />
        <TableBody rowKey={rowKey} />
      </Table>
    );
  },
);

TableMemo.displayName = 'tableMemo';

const getMainIndex = (hasOnSelect: boolean, hasExpandComponent: boolean) => {
  if (hasOnSelect && hasExpandComponent) {
    return 2;
  }
  if (hasOnSelect || hasExpandComponent) {
    return 1;
  }
  return 0;
};

type OpenRows = {
  [id: string]: boolean;
};

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
};

const SelectionProvider = React.createContext<string[] | undefined>(undefined);

type SelectCheckboxProps = {
  onSelect: (isChecked: boolean) => void;
  id: string;
};

const SelectCheckbox: React.FC<SelectCheckboxProps> = ({ onSelect, id }) => {
  const selectedIDs = React.useContext(SelectionProvider);
  const isChecked = selectedIDs?.includes(id);
  return (
    <Checkbox id={`select-${id}`} onChange={() => onSelect(!isChecked)} isChecked={isChecked} />
  );
};

type HostsTable<R> = {
  data: R[];
  content: TableRow<R>[];
  ExpandComponent?: React.ComponentType<ExpandComponentProps<R>>;
  children: React.ReactNode;
  getDataId: (obj: R) => string;
  onSelect?: (obj: R, isSelected: boolean) => void;
  selectedIDs?: string[];
  setSelectedIDs?: (selectedIDs: string[]) => void;
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
  setSelectedIDs,
}: WithTestID & HostsTable<R>) => {
  React.useEffect(() => {
    if (selectedIDs && setSelectedIDs) {
      const idsToRemove: string[] = [];
      selectedIDs.forEach((id) => {
        const matchedData = data.find((d) => getDataId(d) === id);
        if (!matchedData) {
          idsToRemove.push(id);
        }
      });
      if (idsToRemove.length) {
        setSelectedIDs(selectedIDs.filter((id) => !idsToRemove.includes(id)));
      }
    }
  }, [data, setSelectedIDs, selectedIDs, getDataId]);

  const [openRows, setOpenRows] = React.useState<OpenRows>({});
  const [sortBy, setSortBy] = React.useState<ISortBy>({
    index: getMainIndex(!!onSelect, !!ExpandComponent),
    direction: SortByDirection.asc,
  });

  const [contentWithAdditions, columns] = React.useMemo<[TableRow<R>[], (string | ICell)[]]>(() => {
    let newContent = content;
    if (onSelect) {
      newContent = [
        {
          header: {
            title: '', // No readable title above a checkbox
            cellFormatters: [],
          },
          cell: (obj) => {
            const id = getDataId(obj);
            const selectId = `select-${id}`;
            return {
              title: <SelectCheckbox id={id} onSelect={(isChecked) => onSelect(obj, isChecked)} />,
              props: { 'data-testid': selectId },
            };
          },
        },
        ...content,
      ];
    }
    const columns = newContent.map((c) => c.header);
    return [newContent, columns];
  }, [content, onSelect, getDataId]);

  const hostRows = React.useMemo(
    () =>
      _.flatten(
        (data || [])
          .map((obj) => {
            const id = getDataId(obj);
            const cells = contentWithAdditions.filter((c) => !!c.cell).map((c) => c.cell?.(obj));
            const isOpen = !!openRows[id];
            const rows: IRow[] = [
              {
                // visible row
                isOpen,
                cells,
                key: `${id}-master`,
                obj,
                id,
              },
            ];
            if (ExpandComponent) {
              rows.push({
                // expandable detail
                // parent will be set after sorting
                fullWidth: true,
                cells: [
                  {
                    // do not render unnecessarily to improve performance
                    title: isOpen ? <ExpandComponent obj={obj} /> : undefined,
                  },
                ],
                key: `${id}-detail`,
              });
            }
            return rows;
          })
          .sort(
            rowSorter(sortBy, (row, index = 1) =>
              ExpandComponent ? row[0].cells[index - 1] : row[0].cells[index],
            ),
          )
          .map((row, index) => {
            if (ExpandComponent) {
              row[1].parent = index * 2;
            }
            return row;
          }),
      ),
    [ExpandComponent, getDataId, data, openRows, contentWithAdditions, sortBy],
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

  const onSort: OnSort = React.useCallback((_event, index, direction) => {
    setOpenRows({}); // collapse all
    setSortBy({
      index,
      direction,
    });
  }, []);

  return (
    <SelectionProvider.Provider value={selectedIDs}>
      <TableMemo
        rows={rows}
        cells={columns}
        onCollapse={ExpandComponent ? onCollapse : undefined}
        className={className}
        sortBy={sortBy}
        onSort={onSort}
        rowWrapper={HostsTableRowWrapper}
        data-testid={testId}
        actionResolver={actionResolver}
      />
    </SelectionProvider.Provider>
  );
};

export default AITable;
