import React from 'react';
import {
  Table,
  TableProps,
  TableHeader,
  TableBody,
  RowWrapper,
  RowWrapperProps,
  SortByDirection,
  ISortBy,
  OnSort,
  IRow,
  IActionsResolver,
  cellWidth,
  breakWord,
  sortable,
} from '@patternfly/react-table';
import { ClusterTableRows } from '../../../common/types/clusters';
import DeleteClusterModal from './DeleteClusterModal';
import { ClusterRowDataProps, getClusterTableStatusCell } from '../../selectors/clusters';
import { clusterStatusLabels, rowSorter, HumanizedSortable } from '../../../common';
import ClustersListToolbar, { ClusterFiltersType } from './ClustersListToolbar';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';

type DeleteClusterID = Pick<ClusterRowDataProps, 'id' | 'name'>;

const rowKey = ({ rowData }: { rowData?: { props?: ClusterRowDataProps } }): string | undefined =>
  rowData?.props?.id;

const STORAGE_KEY_CLUSTERS_FILTER = 'assisted-installer-cluster-list-filters';

interface ClustersTableProps {
  rows: ClusterTableRows;
  deleteCluster: (id: string) => void;
}

type TablePropsCellType = TableProps['cells'][0];
type StoredFilters = { filters: ClusterFiltersType; sortBy: ISortBy; searchString: string };

const columnConfig: TablePropsCellType = {
  transforms: [sortable],
  cellTransforms: [],
  formatters: [],
  cellFormatters: [],
  props: {},
};

const columns: TablePropsCellType[] = [
  {
    title: 'Name',
    dataLabel: 'Name',
    ...columnConfig,
    transforms: columnConfig?.transforms?.concat(cellWidth(20)),
    cellTransforms: columnConfig?.cellTransforms?.concat(breakWord),
  },
  {
    title: 'Base domain',
    dataLabel: 'Base domain',
    ...columnConfig,
    transforms: columnConfig?.transforms?.concat(cellWidth(40)),
    cellTransforms: columnConfig?.cellTransforms?.concat(breakWord),
  },
  { title: 'Version', dataLabel: 'Version', ...columnConfig },
  { title: 'Status', dataLabel: 'Status', ...columnConfig },
  { title: 'Hosts', dataLabel: 'Hosts', ...columnConfig },
  { title: 'Created at', dataLabel: 'Created at', ...columnConfig },
];

const getStatusCell = (row: IRow) => row.cells?.[3] as HumanizedSortable | undefined;

const ClusterRowWrapper = (_props: RowWrapperProps) => {
  const name = (_props?.row?.props as ClusterRowDataProps | undefined)?.name || '';
  const props = {
    ..._props,
    id: `cluster-row-${name}`,
    'data-testid': `cluster-row-${name}`,
  };
  return <RowWrapper {...props} />;
};

const ClustersTable: React.FC<ClustersTableProps> = ({ rows, deleteCluster }) => {
  const [deleteClusterID, setDeleteClusterID] = React.useState<DeleteClusterID>();
  const [sortBy, setSortBy] = React.useState<ISortBy>({
    index: 0, // Name-column
    direction: SortByDirection.asc,
  });

  const [searchString, setSearchString] = React.useState('');
  const [filters, setFilters] = React.useState<ClusterFiltersType>({
    status: [],
  });

  const { t } = useTranslation();

  React.useEffect(() => {
    const marshalled = window.sessionStorage.getItem(STORAGE_KEY_CLUSTERS_FILTER);
    if (marshalled) {
      try {
        const parsed = JSON.parse(marshalled) as StoredFilters;
        parsed.filters && setFilters(parsed.filters);
        parsed.sortBy && setSortBy(parsed.sortBy);
        parsed.searchString && setSearchString(parsed.searchString);
      } catch (e) {
        console.info('Failed to restore clusters filter: ', e);
      }
    }
  }, []);

  React.useEffect(() => {
    window.sessionStorage.setItem(
      STORAGE_KEY_CLUSTERS_FILTER,
      JSON.stringify({ filters, sortBy, searchString }),
    );
  }, [filters, sortBy, searchString]);

  const actionResolver: IActionsResolver = React.useCallback(
    (rowData) => {
      const props = rowData.props as ClusterRowDataProps;
      return [
        {
          title: 'Delete',
          id: `button-delete-${props.name}`,
          isDisabled:
            getClusterTableStatusCell(rowData).sortableValue === clusterStatusLabels(t).installing,
          onClick: (/*event: React.MouseEvent, rowIndex: number, rowData: IRowData*/) => {
            setDeleteClusterID({ id: props.id, name: props.name });
          },
        },
      ];
    },
    [t],
  );

  const onSort: OnSort = React.useCallback(
    (_event, index, direction) => {
      setSortBy({
        index,
        direction,
      });
    },
    [setSortBy],
  );

  const rowFilter = React.useCallback(
    (row: IRow) => {
      const props = row.props as ClusterRowDataProps;
      const searchableProps: string[] = [props.name, props.id, props.baseDnsDomain].map(
        (prop?: string) => (prop || '').toLowerCase(),
      );
      if (
        searchString &&
        !searchableProps.find((prop) => prop.includes(searchString.toLowerCase()))
      ) {
        return false;
      }

      const value = getStatusCell(row)?.sortableValue as string;
      if (filters.status.length > 0 && value && !filters.status.includes(value)) {
        return false;
      }

      return true;
    },
    [searchString, filters],
  );

  const sortedRows = React.useMemo(() => {
    return rows
      .filter(rowFilter)
      .sort(
        rowSorter(
          sortBy,
          (row: IRow, index = 0) => row.cells?.[index] as string | HumanizedSortable,
        ),
      );
  }, [rows, sortBy, rowFilter]);

  return (
    <>
      <ClustersListToolbar
        searchString={searchString}
        setSearchString={setSearchString}
        filters={filters}
        setFilters={setFilters}
      />
      <Table
        rows={sortedRows}
        cells={columns}
        actionResolver={actionResolver}
        aria-label="Clusters table"
        sortBy={sortBy}
        onSort={onSort}
        rowWrapper={ClusterRowWrapper}
        data-testid={'clusters-table'}
      >
        <TableHeader />
        <TableBody rowKey={rowKey} />
      </Table>
      {deleteClusterID && (
        <DeleteClusterModal
          name={deleteClusterID.name}
          onClose={() => setDeleteClusterID(undefined)}
          onDelete={() => {
            deleteCluster(deleteClusterID.id);
            setDeleteClusterID(undefined);
          }}
        />
      )}
    </>
  );
};

export default ClustersTable;
