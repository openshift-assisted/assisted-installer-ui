import * as React from 'react';
import { Dropdown, DropdownItem, DropdownToggle, FormGroup } from '@patternfly/react-core';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import {
  architectureData,
  ClusterDetailsValues,
  CpuArchitecture,
  getFieldId,
  StaticField,
  SupportedCpuArchitecture,
} from '../../../common';
import { useField, useFormikContext } from 'formik';

const CpuArchitectureDropdown = ({ isDisabled = false }: { isDisabled?: boolean }) => {
  const { t } = useTranslation();
  const { setFieldValue } = useFormikContext<ClusterDetailsValues>();
  const [{ name, value }, , { setValue }] = useField<SupportedCpuArchitecture>('cpuArchitecture');
  const [cpuArchOpen, setCpuArchOpen] = React.useState(false);
  const fieldId = getFieldId(name, 'input');

  const onCpuArchToggle = React.useCallback(() => {
    if (cpuArchOpen) {
      setCpuArchOpen(false);
    } else {
      setCpuArchOpen(true);
    }
  }, [cpuArchOpen]);

  const onCpuArchSelect = React.useCallback(
    (e?: React.SyntheticEvent<HTMLDivElement>) => {
      const val = e?.currentTarget.id as SupportedCpuArchitecture;
      setValue(val);

      if (val === CpuArchitecture.s390x) {
        setFieldValue('userManagedNetworking', true);
      } else {
        setFieldValue('userManagedNetworking', false);
      }
      setCpuArchOpen(false);
    },
    [setValue, setFieldValue],
  );

  return !isDisabled ? (
    <FormGroup isInline fieldId={fieldId} label={t('ai:CPU architecture')} required>
      <Dropdown
        toggle={
          <DropdownToggle onToggle={onCpuArchToggle} className="pf-u-w-100">
            {value ? architectureData[value].label : t('ai:CPU architecture')}
          </DropdownToggle>
        }
        name="cpuArchitecture"
        isOpen={cpuArchOpen}
        onSelect={onCpuArchSelect}
        dropdownItems={[
          <DropdownItem
            key={'x86_64'}
            id="x86_64"
            description={architectureData['x86_64'].description}
          >
            {architectureData['x86_64'].label}
          </DropdownItem>,
          <DropdownItem
            key={'arm64'}
            id="arm64"
            description={architectureData['arm64'].description}
          >
            {architectureData['arm64'].label}
          </DropdownItem>,
          <DropdownItem
            key={'s390x'}
            id="s390x"
            description={architectureData['s390x'].description}
          >
            {architectureData['s390x'].label}
          </DropdownItem>,
        ]}
        className="pf-u-w-100"
      />
    </FormGroup>
  ) : (
    <StaticField name={'cpuArchitecture'} label={t('ai:CPU architecture')} isRequired>
      {architectureData[value].label}
    </StaticField>
  );
};

export default CpuArchitectureDropdown;
