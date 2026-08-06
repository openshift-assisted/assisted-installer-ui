import React from 'react';
import Fuse from 'fuse.js';
import { StorageClassK8sResource } from '../../../../types';
import { SelectFieldWithSearch, useTranslation } from '../../../../../common';
import { useField } from 'formik';

const NO_RESULTS = 'no_results';

export const StorageClassDropdown = ({
  storageClasses,
}: {
  storageClasses: StorageClassK8sResource[];
}) => {
  const { t } = useTranslation();
  const [filter, setFilter] = React.useState('');
  const [, , { setValue }] = useField('storageClass');

  const storageClassItems = React.useMemo(
    () =>
      storageClasses.map((storageClass) => ({
        value: storageClass.metadata?.name as string,
        children: storageClass.metadata?.name as string,
      })),
    [storageClasses],
  );

  const fuse = React.useMemo(() => {
    return new Fuse(storageClassItems, {
      includeScore: true,
      ignoreLocation: true,
      threshold: 0.3,
      keys: ['value'],
    });
  }, [storageClassItems]);

  const selectOptions = React.useMemo(() => {
    if (filter) {
      const newSelectOptions = fuse
        .search(filter)
        .sort((a, b) => (a.score || 0) - (b.score || 0))
        .map(({ item }) => item);

      if (!newSelectOptions.length) {
        return [
          {
            isAriaDisabled: true,
            children: t('ai:No results found for {{filter}}', { filter }),
            value: NO_RESULTS,
            hasCheckbox: false,
          },
        ];
      }
      return newSelectOptions;
    }
    return storageClassItems;
  }, [filter, fuse, storageClassItems, t]);

  return (
    <SelectFieldWithSearch
      selectOptions={selectOptions}
      filterValue={filter}
      setFilterValue={setFilter}
      name={'storageClass'}
      label={t('ai:Storage class')}
      placeholder={t('ai:No storage class selected')}
      helperText={t('ai:Persistent volume storage class for etcd data volumes')}
      onClear={() => setValue('')}
    />
  );
};
