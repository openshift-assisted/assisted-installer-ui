import React from 'react';
import { SelectOptionProps } from '@patternfly/react-core';
import { useField } from 'formik';
import { OpenshiftVersionOptionType } from '../../types';
import { HelperTextType } from './OpenShiftVersionDropdown';
import { useTranslation } from '../../hooks';
import { SelectFieldWithSearch } from './formik';
import { ClusterDetailsValues } from '../clusterWizard';

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
  const initialSelectOptions = React.useMemo(
    () =>
      versions.map((version) => ({
        children:
          version.supportLevel === 'beta'
            ? version.label + ' - ' + 'Developer preview release'
            : version.label,
        value: version.value,
      })),
    [versions],
  );

  const [filterValue, setFilterValue] = React.useState<string>('');
  const [selectOptions, setSelectOptions] =
    React.useState<SelectOptionProps[]>(initialSelectOptions);

  const helperText = getHelperText && getHelperText(value, true);

  React.useEffect(() => {
    let newSelectOptions: SelectOptionProps[] = initialSelectOptions;

    // Filter menu items based on the text input value when one exists
    if (filterValue) {
      newSelectOptions = initialSelectOptions.filter((menuItem) =>
        String(menuItem.children).toLowerCase().includes(filterValue.toLowerCase()),
      );

      // When no options are found after filtering, display 'No results found'
      if (!newSelectOptions.length) {
        newSelectOptions = [
          {
            isDisabled: true,
            children: t('ai:No results found for {{filter}}', { filter: filterValue }),
            value: 'no_results',
          },
        ];
      }
    }

    const selectOptionsWithDividers = newSelectOptions.map((option, index) => {
      const match = (option.value as string).match(/\d+\.(\d+)\.\d+/);
      const y = match ? match[1] : null;

      const previousY =
        index > 0
          ? ((newSelectOptions[index - 1].value as string).match(/\d+\.(\d+)\.\d+/) || [])[1]
          : null;

      return {
        ...option,
        showDivider: previousY !== null && y !== previousY,
      };
    });

    setSelectOptions(selectOptionsWithDividers);
  }, [filterValue, initialSelectOptions, t]);

  return (
    <SelectFieldWithSearch
      selectOptions={selectOptions}
      filterValue={filterValue}
      setFilterValue={setFilterValue}
      name={'customOpenshiftSelect'}
      helperText={
        helperText ??
        t(
          'ai:Select an OpenShift version from the list or use the type ahead to narrow down the list.',
        )
      }
    />
  );
};
