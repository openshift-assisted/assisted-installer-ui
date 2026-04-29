import React from 'react';
import {
  Table,
  TableText,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  BaseCellProps,
  ActionsColumn,
  ThProps,
  SortByDirection,
  IRow,
  ISortBy,
  TrProps,
} from '@patternfly/react-table';
import {
  ClusterRowDataProps,
  getClusterTableStatusCell,
} from '../../store/slices/clusters/selectors';
import ClustersListToolbar, { ClusterFiltersType } from './ClustersListToolbar';
import {
  clusterStatusLabels,
  ClusterTableRows,
  HumanizedSortable,
  rowSorter,
  EmptyState,
} from '../../../common';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import DeleteClusterModal from './DeleteClusterModal';

type DeleteClusterID = Pick<ClusterRowDataProps, 'id' | 'name'>;
const STORAGE_KEY_CLUSTERS_FILTER = 'assisted-installer-cluster-list-filters';

interface ClustersTableProps {
  rows: ClusterTableRows;
  deleteCluster: (id: string) => Promise<void>;
}

type StoredFilters = { filters: ClusterFiltersType; sortBy: ISortBy; searchString: string };

const columns = [
  { title: 'Name', cellWidth: 20 },
  { title: 'Base domain', cellWidth: 40 },
  { title: 'Version' },
  { title: 'Status' },
  { title: 'Hosts' },
  { title: 'Created at' },
];

const getStatusCell = (row: IRow) => row.cells?.[3] as HumanizedSortable | undefined;

const getRowProps = (props?: ClusterRowDataProps) => {
  const name = props?.name || '';
  return {
    ...props,
    id: `cluster-row-${name}`,
    'data-testid': `cluster-row-${name}`,
  } as Omit<TrProps, 'ref'>;
};

const ClustersTable = ({ rows, deleteCluster }: ClustersTableProps) => {
  const [sortBy, setSortBy] = React.useState<ISortBy>({
    index: 0, // Name-column
    direction: SortByDirection.asc,
  });

  const [deleteClusterID, setDeleteClusterID] = React.useState<DeleteClusterID>();
  const [isDeleteInProgress, setDeleteInProgress] = React.useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = React.useState(false);

  const [searchString, setSearchString] = React.useState('');
  const [filters, setFilters] = React.useState<ClusterFiltersType>({
    status: [],
  });

  const { t } = useTranslation();

  const getSortParams = (columnIndex: number): ThProps['sort'] => ({
    sortBy,
    onSort: (_event, index, direction) => {
      setSortBy({ index, direction });
    },
    columnIndex,
  });

  React.useEffect(() => {
    const marshalled = window.sessionStorage.getItem(STORAGE_KEY_CLUSTERS_FILTER);
    if (marshalled) {
      try {
        const parsed = JSON.parse(marshalled) as StoredFilters;
        parsed.filters && setFilters(parsed.filters);
        parsed.sortBy && setSortBy(parsed.sortBy);
        parsed.searchString && setSearchString(parsed.searchString);
      } catch (e) {
        // console.info('Failed to restore clusters filter: ', e);
      }
    }
  }, []);

  React.useEffect(() => {
    window.sessionStorage.setItem(
      STORAGE_KEY_CLUSTERS_FILTER,
      JSON.stringify({ filters, sortBy, searchString }),
    );
  }, [filters, sortBy, searchString]);

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

  const closeModal = () => {
    setDeleteClusterID(undefined);
    setDeleteModalOpen(false);
  };

  const handleDelete = async () => {
    setDeleteInProgress(true);
    await deleteCluster(deleteClusterID?.id || '');
    setDeleteInProgress(false);
    closeModal();
  };

  const hasActiveFilters = searchString.length > 0 || filters.status.length > 0;

  return (
    <>
      <ClustersListToolbar
        searchString={searchString}
        setSearchString={(_event, value) => setSearchString(value)}
        filters={filters}
        setFilters={setFilters}
      />
      {sortedRows.length === 0 && hasActiveFilters ? (
        <EmptyState
          title="No matching clusters"
          content="No clusters match the current filter criteria. Try adjusting your filters."
        />
      ) : (
        <Table aria-label="Clusters table" data-testid={'clusters-table'}>
          <Thead>
            <Tr>
              {columns.map((col, i) => (
                <Th
                  key={`col-${i}`}
                  width={col.cellWidth as BaseCellProps['width']}
                  sort={getSortParams(i)}
                >
                  <TableText>{col.title}</TableText>
                </Th>
              ))}
              <Th key="col-action" />
            </Tr>
          </Thead>
          <Tbody>
            {sortedRows.map((row, i) => (
              <Tr {...getRowProps(row.props as ClusterRowDataProps)} key={`row-${i}`}>
                {row.cells?.map((cell, j) => {
                  const humanized = cell as HumanizedSortable;
                  return (
                    <Td dataLabel={columns[j].title} key={`cell-${i}-${j}`} {...humanized.props}>
                      <TableText wrapModifier="breakWord">{humanized?.title}</TableText>
                    </Td>
                  );
                })}
                <Td isActionCell>
                  <ActionsColumn
                    items={[
                      {
                        title: 'Delete',
                        id: `button-delete-${(row.props as ClusterRowDataProps).name}`,
                        isDisabled:
                          getClusterTableStatusCell(row).sortableValue ===
                          clusterStatusLabels(t).installing,
                        onClick: () => {
                          setDeleteClusterID({
                            id: (row.props as ClusterRowDataProps).id,
                            name: (row.props as ClusterRowDataProps).name,
                          });
                          setDeleteModalOpen(true);
                        },
                      },
                    ]}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
      <DeleteClusterModal
        name={deleteClusterID?.name || ''}
        onClose={closeModal}
        onDelete={() => void handleDelete()}
        isDeleteInProgress={isDeleteInProgress}
        isOpen={isDeleteModalOpen}
      />
    </>
  );
};

export default ClustersTable;
