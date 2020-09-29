import React from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  RowWrapper,
  RowWrapperProps,
  IRowData,
  SortByDirection,
  ISortBy,
  OnSort,
  IRow,
  IActionsResolver,
} from '@patternfly/react-table';
import { ExtraParamsType } from '@patternfly/react-table/dist/js/components/Table/base/types';
import { ClusterTableRows } from '../../types/clusters';
import { rowSorter, HumanizedSortable } from '../ui/table/utils';
import sortable from '../ui/table/sortable';
import DeleteClusterModal from './DeleteClusterModal';
import { getClusterTableStatusCell } from '../../selectors/clusters';
import { CLUSTER_STATUS_LABELS } from '../../config/constants';
import ClustersFilterToolbar, { ClusterFiltersType } from './ClustersFilterToolbar';

const rowKey = ({ rowData }: ExtraParamsType) => rowData?.props.id;

const STORAGE_KEY_CLUSTERS_FILTER = 'assisted-installer-cluster-list-filters';

interface ClustersTableProps {
  rows: ClusterTableRows;
  deleteCluster: (id: string) => void;
}

const columnConfig = {
  transforms: [sortable],
  cellTransforms: [],
  formatters: [],
  cellFormatters: [],
  props: {},
};

const columns = [
  { title: 'Name', ...columnConfig },
  { title: 'Base domain', ...columnConfig },
  { title: 'Version', ...columnConfig },
  { title: 'Status', ...columnConfig },
  { title: 'Hosts', ...columnConfig },
];

const getStatusCell = (row: IRow) => row.cells?.[3] as HumanizedSortable | undefined;

const ClusterRowWrapper = (props: RowWrapperProps) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  return <RowWrapper {...props} id={`cluster-row-${props.row?.props?.name}`} />;
};

const ClustersTable: React.FC<ClustersTableProps> = ({ rows, deleteCluster }) => {
  const [deleteClusterID, setDeleteClusterID] = React.useState<DeleteClusterID>();
  const [sortBy, setSortBy] = React.useState<ISortBy>({
    index: 0, // Name-column
    direction: SortByDirection.asc,
  });

  const [searchName, setSearchName] = React.useState('');
  const [filters, setFilters] = React.useState<ClusterFiltersType>({
    status: [],
  });

  React.useEffect(() => {
    const marshalled = window.sessionStorage.getItem(STORAGE_KEY_CLUSTERS_FILTER);
    if (marshalled) {
      try {
        const parsed = JSON.parse(marshalled);
        setFilters(parsed);
      } catch (e) {
        console.info('Failed to restore clusters filter: ', e);
      }
    }
  }, []);

  React.useEffect(() => {
    window.sessionStorage.setItem(STORAGE_KEY_CLUSTERS_FILTER, JSON.stringify(filters));
  }, [filters]);

  const actionResolver: IActionsResolver = React.useCallback(
    (rowData) => [
      {
        title: 'Delete',
        id: `button-delete-${rowData.props.name}`,
        isDisabled:
          getClusterTableStatusCell(rowData).sortableValue === CLUSTER_STATUS_LABELS.installing,
        onClick: (event: React.MouseEvent, rowIndex: number, rowData: IRowData) => {
          setDeleteClusterID({ id: rowData.props.id, name: rowData.props.name });
        },
      },
    ],
    [setDeleteClusterID],
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
      if (searchName && !(row.props.name || '').toLowerCase().includes(searchName.toLowerCase())) {
        return false;
      }

      const value = getStatusCell(row)?.sortableValue as string;
      if (filters.status.length > 0 && value && !filters.status.includes(value)) {
        return false;
      }

      return true;
    },
    [searchName, filters],
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
      <ClustersFilterToolbar
        searchName={searchName}
        setSearchName={setSearchName}
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

type DeleteClusterID = {
  id: string;
  name: string;
};

export default ClustersTable;
