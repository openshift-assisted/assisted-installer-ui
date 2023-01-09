import { OnPerPageSelect, OnSetPage, PerPageOptions } from '@patternfly/react-core';
import * as React from 'react';

type PaginationCallbacks = {
  onSetPage: OnSetPage;
  onPerPageSelect: OnPerPageSelect;
};

const perPageOptions: PerPageOptions[] = [
  {
    title: '10',
    value: 10,
  },
  {
    title: '20',
    value: 20,
  },
];

export const usePagination = (dataCount: number) => {
  const [perPage, setPerPage] = React.useState(10);
  const [page, setPage] = React.useState(1);

  const { onSetPage, onPerPageSelect } = React.useMemo<PaginationCallbacks>(
    () => ({
      onSetPage: (evt, pageNumber) => setPage(pageNumber),
      onPerPageSelect: (evt, perPage) => setPerPage(perPage),
    }),
    [],
  );

  const showPagination = dataCount > 10;

  return {
    showPagination,
    perPage,
    page,
    onSetPage,
    onPerPageSelect,
    perPageOptions,
  };
};
