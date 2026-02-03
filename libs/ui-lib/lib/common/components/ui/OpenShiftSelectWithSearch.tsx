import React from 'react';
import { useField } from 'formik';
import { OpenshiftVersionOptionType } from '../../types';
import { HelperTextType } from './OpenShiftVersionDropdown';
import { useTranslation } from '../../hooks';
import { SelectFieldWithSearch } from './formik';
import { ClusterDetailsValues } from '../clusterWizard';
import { getVersionLabel } from './utils';

type OpenshiftSelectWithSearchProps = {
  versions: OpenshiftVersionOptionType[];
  getHelperText?: HelperTextType;
};

export const OpenShiftSelectWithSearch: React.FunctionComponent<OpenshiftSelectWithSearchProps> = ({
  versions,
  getHelperText,
}: OpenshiftSelectWithSearchProps) => {
  const { t } = useTranslation();
  const [{ value }] =
    useField<ClusterDetailsValues['customOpenshiftSelect']>('customOpenshiftSelect');

  const [filterValue, setFilterValue] = React.useState<string>('');

  const selectOptions = React.useMemo(() => {
    const options = versions
      .map((version) => ({
        children: getVersionLabel(version, t),
        value: version.value,
      }))
      .filter((v) =>
        filterValue ? String(v.children).toLowerCase().includes(filterValue.toLowerCase()) : true,
      );

    if (!options.length) {
      return [
        {
          isDisabled: true,
          children: t('ai:No results found for {{filter}}', { filter: filterValue }),
          value: 'no_results',
        },
      ];
    }
    return options.map((option, index) => {
      const match = option.value.match(/\d+\.(\d+)\.\d+/);
      const y = match ? match[1] : null;

      const previousY =
        index > 0 ? (options[index - 1].value.match(/\d+\.(\d+)\.\d+/) || [])[1] : null;

      return {
        ...option,
        showDivider: previousY !== null && y !== previousY,
      };
    });
  }, [filterValue, versions, t]);

  return (
    <SelectFieldWithSearch
      selectOptions={selectOptions}
      filterValue={filterValue}
      setFilterValue={setFilterValue}
      name={'customOpenshiftSelect'}
      helperText={
        getHelperText?.(value, true) ??
        t(
          'ai:Select an OpenShift version from the list or use the type ahead to narrow down the list.',
        )
      }
    />
  );
};
