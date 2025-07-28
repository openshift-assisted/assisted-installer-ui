import React from 'react';
import { Checkbox, Pagination, PaginationVariant } from '@patternfly/react-core';
import {
  IRow,
  SortByDirection,
  ISortBy,
  OnSort,
  IAction,
  ISeparator,
  TableProps,
} from '@patternfly/react-table';
import xor from 'lodash-es/xor.js';

import { getColSpanRow, HumanizedSortable, rowSorter } from '../ui';
import { WithTestID } from '../../types';
import { AITableMemo, TableMemoColType, TableMemoProps } from './AITableMemo';
import { usePagination } from './usePagination';
import './HostsTable.css';

type OpenRows = {
  [id: string]: boolean;
};

export type TableRow<R> = {
  header: TableMemoColType;
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
  variant?: TableProps['variant'];
  alreadySorted?: boolean;
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
  variant,
  alreadySorted,
}: WithTestID & AITableProps<R>) => {
  const itemIDs = React.useMemo(() => data.map(getDataId), [data, getDataId]);
  const [openRows, setOpenRows] = React.useState<OpenRows>({});

  const sortByRef = React.useRef<ISortBy>();
  const [sortBy, setSortBy] = React.useState<ISortBy>({
    index: onSelect ? 1 : 0,
    direction: SortByDirection.asc,
  });

  const dataRef = React.useRef(data);
  if (dataRef.current !== data) {
    dataRef.current = data;
  }

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

  React.useEffect(() => {
    if (alreadySorted) {
      sortByRef.current = sortBy;
      setSortBy({
        index: -1,
        direction: SortByDirection.asc,
      });
    } else {
      if (sortBy.index === -1 && sortByRef.current) {
        setSortBy(sortByRef.current);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alreadySorted]);

  React.useEffect(() => {
    if (!alreadySorted) {
      sortByRef.current = sortBy;
    } else if (alreadySorted && sortBy.index !== -1) {
      sortByRef.current = sortBy;
    }
  }, [sortBy, alreadySorted]);

  const onSelectAll = React.useCallback(
    (isChecked: boolean) => {
      setSelectedIDs?.(isChecked ? dataRef.current.map(getDataId) : []);
    },
    [setSelectedIDs, getDataId],
  );

  const [contentWithAdditions, columns] = React.useMemo(() => {
    let newContent = content;
    if (onSelect) {
      newContent = [
        {
          header: {
            title: canSelectAll ? <SelectAllCheckbox onSelect={onSelectAll} /> : '',
            sort: false,
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
    const columns = newContent.map(
      (c) =>
        ({
          ...c.header,
          sort: c.header.sort ?? true,
        } as TableMemoColType),
    );
    return [newContent, columns];
  }, [canSelectAll, content, getDataId, onSelect, onSelectAll]);

  const getRows = React.useCallback(
    (data: R[]) =>
      (data || [])
        .map<IRow>((obj) => {
          const id = getDataId(obj);
          const cells = contentWithAdditions.filter((c) => !!c.cell).map((c) => c.cell?.(obj));
          const isOpen = !!openRows[id];
          return {
            isOpen,
            cells,
            key: `${id}-master`,
            id,
            actions: actionResolver ? actionResolver(obj) : undefined,
            nestedComponent: ExpandComponent ? <ExpandComponent obj={obj} /> : undefined,
          };
        })
        .slice((page - 1) * perPage, page * perPage),
    [page, perPage, getDataId, contentWithAdditions, openRows, actionResolver, ExpandComponent],
  );

  const hostRows = React.useMemo(() => getRows(data), [data, getRows]);

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

  const sortedRows = React.useMemo(() => {
    if (alreadySorted && sortBy.index === -1) {
      return getRows(data);
    }
    return rows.sort(
      rowSorter(sortBy, (row: IRow, index = 0) => row.cells?.[index] as string | HumanizedSortable),
    );
  }, [alreadySorted, sortBy, rows, getRows, data]);

  return (
    <>
      <SelectionProvider.Provider
        value={{
          selectedIDs,
          allIDs: itemIDs,
        }}
      >
        <AITableMemo
          rows={sortedRows as TableMemoProps['rows']}
          cols={columns}
          onCollapse={ExpandComponent ? onCollapse : undefined}
          className={className}
          data-testid={testId}
          sortBy={sortBy}
          onSort={onSort}
          variant={variant}
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
