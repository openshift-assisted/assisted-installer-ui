import React from 'react';
import { Checkbox, Pagination, PaginationVariant } from '@patternfly/react-core';
import {
  Table,
  TableHeader,
  TableBody,
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
  InnerScrollContainer,
} from '@patternfly/react-table';
import { ExtraParamsType } from '@patternfly/react-table/dist/js/components/Table/base';
import xor from 'lodash/xor';
import classnames from 'classnames';

import { getColSpanRow, rowSorter } from '../ui';
import { WithTestID } from '../../types';
import { usePagination } from './usePagination';
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
    // new prop for @patternfly/react-table 4.67.7 which is used in ACM, but not in OCM
    const newProps = {
      canCollapseAll: false,
    };
    return (
      <InnerScrollContainer>
        <Table
          rows={rows}
          cells={cells}
          onCollapse={onCollapse}
          aria-label="Hosts table"
          className={classnames(className, 'hosts-table')}
          sortBy={sortBy}
          onSort={onSort}
          rowWrapper={rowWrapper}
          data-testid={testId}
          actionResolver={actionResolver ? tableActionResolver : undefined}
          {...newProps}
        >
          <TableHeader />
          <TableBody rowKey={rowKey} />
        </Table>
      </InnerScrollContainer>
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
  <RowWrapper {...props} data-testid={`host-row-${Number(props.rowProps?.rowIndex)}`} />
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

const SelectionProvider = React.createContext<{
  selectedIDs: string[] | undefined;
  allIDs: string[];
}>({
  selectedIDs: [],
  allIDs: [],
});

type SelectCheckboxProps = {
  onSelect: (isChecked: boolean) => void;
  id: string;
};
const SelectCheckbox: React.FC<SelectCheckboxProps> = ({ onSelect, id }) => {
  const { selectedIDs } = React.useContext(SelectionProvider);
  const isChecked = selectedIDs?.includes(id);
  return (
    <Checkbox id={`select-${id}`} onChange={() => onSelect(!isChecked)} isChecked={isChecked} />
  );
};

type SelectAllCheckboxProps = {
  onSelect: (isChecked: boolean) => void;
};

const SelectAllCheckbox: React.FC<SelectAllCheckboxProps> = ({ onSelect }) => {
  const { allIDs, selectedIDs } = React.useContext(SelectionProvider);
  const isChecked = xor(allIDs, selectedIDs).length === 0;
  return allIDs.length ? (
    <Checkbox id="select-all" onChange={() => onSelect(!isChecked)} isChecked={isChecked} />
  ) : (
    <div />
  );
};

export type AITableProps<R> = ReturnType<typeof usePagination> & {
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
  canSelectAll?: boolean;
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
  perPage,
  page,
  onSetPage,
  onPerPageSelect,
  showPagination,
  perPageOptions,
  canSelectAll,
}: WithTestID & AITableProps<R>) => {
  const itemIDs = React.useMemo(() => data.map(getDataId), [data, getDataId]);
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

  const dataRef = React.useRef(data);
  if (dataRef.current !== data) {
    dataRef.current = data;
  }
  const onSelectAll = React.useCallback(
    (isChecked: boolean) => {
      setSelectedIDs?.(isChecked ? dataRef.current.map(getDataId) : []);
    },
    [setSelectedIDs, getDataId],
  );

  const [contentWithAdditions, columns] = React.useMemo<[TableRow<R>[], (string | ICell)[]]>(() => {
    let newContent = content;
    if (onSelect) {
      newContent = [
        {
          header: {
            title: canSelectAll ? <SelectAllCheckbox onSelect={onSelectAll} /> : '',
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
  }, [content, onSelect, getDataId, onSelectAll, canSelectAll]);

  const hostRows = React.useMemo(() => {
    let rows = (data || [])
      .map<IRow>((obj) => {
        const id = getDataId(obj);
        const cells = contentWithAdditions.filter((c) => !!c.cell).map((c) => c.cell?.(obj));
        const isOpen = !!openRows[id];
        return {
          // visible row
          isOpen,
          cells,
          key: `${id}-master`,
          obj,
          id,
        };
      })
      .sort(
        rowSorter(sortBy, (row, index = 1) =>
          // eslint-disable-next-line
          ExpandComponent ? row.cells?.[index - 1] : (row.cells?.[index] as any),
        ),
      )
      .slice((page - 1) * perPage, page * perPage);
    if (ExpandComponent) {
      rows = rows.reduce((allRows, row: IRow, index) => {
        allRows.push(row);
        if (ExpandComponent) {
          allRows.push({
            // expandable detail
            // parent will be set after sorting
            cells: [
              {
                // do not render unnecessarily to improve performance
                title: row.isOpen ? <ExpandComponent obj={row.obj as R} /> : undefined,
                props: { colSpan: columns.length },
              },
            ],
            key: `${(row.id as string) || ''}-detail`,
            parent: index * 2,
          });
        }
        return allRows;
      }, [] as IRow[]);
    }
    return rows;
  }, [
    contentWithAdditions,
    ExpandComponent,
    getDataId,
    data,
    openRows,
    sortBy,
    page,
    perPage,
    columns.length,
  ]);
  const rows = React.useMemo(() => {
    if (hostRows.length) {
      return hostRows;
    }
    return getColSpanRow(children, columns.length);
  }, [hostRows, columns, children]);
  const onCollapse = React.useCallback(
    (_event, rowKey: number) => {
      const id = hostRows[rowKey].id as string;
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
    <>
      <SelectionProvider.Provider
        value={{
          selectedIDs,
          allIDs: itemIDs,
        }}
      >
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
      {showPagination && (
        <Pagination
          variant={PaginationVariant.bottom}
          itemCount={itemIDs.length}
          perPage={perPage}
          onPerPageSelect={onPerPageSelect}
          page={page}
          onSetPage={onSetPage}
          perPageOptions={perPageOptions}
        />
      )}
    </>
  );
};
export default AITable;
