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
import ClustersFilterToolbar, {
  ClusterListFilter,
  ClustersFilterToolbarProps,
  initialClusterListFilter,
} from './ClustersFilterToolbar';

const rowKey = ({ rowData }: ExtraParamsType) => rowData?.props.id;

const STORAGE_KEY_CLUSTERS_FILTER = 'assisted-installer-cluster-list-filters';

interface ClustersTableProps {
  rows: ClusterTableRows;
  deleteCluster: (id: string) => void;
  clusterListFilter: ClusterListFilter;
  setClusterListFilter: ClustersFilterToolbarProps['setClusterListFilter'];
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
  { title: 'Created at', ...columnConfig },
];

const getStatusCell = (row: IRow) => row.cells?.[3] as HumanizedSortable | undefined;

const ClusterRowWrapper = (props: RowWrapperProps) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  return <RowWrapper {...props} id={`cluster-row-${props.row?.props?.name}`} />;
};

const ClustersTable: React.FC<ClustersTableProps> = ({
  rows,
  deleteCluster,
  clusterListFilter,
  setClusterListFilter,
}) => {
  const [deleteClusterID, setDeleteClusterID] = React.useState<DeleteClusterID>();
  const [sortBy, setSortBy] = React.useState<ISortBy>({
    index: 0, // Name-column
    direction: SortByDirection.asc,
  });

  React.useEffect(
    () => {
      const marshalled = window.sessionStorage.getItem(STORAGE_KEY_CLUSTERS_FILTER);
      if (marshalled) {
        try {
          const parsed = JSON.parse(marshalled);
          parsed.clusterListFilter && setClusterListFilter(parsed.clusterListFilter);
          parsed.sortBy && setSortBy(parsed.sortBy);
        } catch (e) {
          console.info('Failed to restore clusters filter: ', e);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  React.useEffect(() => {
    window.sessionStorage.setItem(
      STORAGE_KEY_CLUSTERS_FILTER,
      JSON.stringify({ clusterListFilter, sortBy }),
    );
  }, [clusterListFilter, sortBy]);

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
      const searchableProps: string[] = [
        row.props.name,
        row.props.id,
        row.props.baseDnsDomain,
      ].map((prop) => (prop || '').toLowerCase());

      if (
        clusterListFilter.searchString &&
        !searchableProps.find((prop) => prop.includes(clusterListFilter.searchString.toLowerCase()))
      ) {
        return false;
      }

      const anyStatusSelected = !!Object.getOwnPropertyNames(clusterListFilter.status).find(
        (state) => clusterListFilter.status[state],
      );
      const value = getStatusCell(row)?.sortableValue as string;
      if (value && anyStatusSelected && !clusterListFilter.status[value]) {
        return false;
      }

      return true;
    },
    [clusterListFilter],
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
        clusterListFilter={clusterListFilter}
        setClusterListFilter={setClusterListFilter}
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
