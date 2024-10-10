import * as React from 'react';
import { Dropdown, DropdownItem, DropdownToggle, FormGroup } from '@patternfly/react-core';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import {
  architectureData,
  CpuArchitecture,
  getFieldId,
  StaticField,
  SupportedCpuArchitecture,
} from '../../../common';
import { useField } from 'formik';
import { useFormikHelpers } from '../../../common/hooks/useFormikHelpers';

const CpuArchitectureDropdown = ({ isDisabled = false }: { isDisabled?: boolean }) => {
  const { t } = useTranslation();
  const [{ name, value }, , { setValue }] = useField<SupportedCpuArchitecture>('cpuArchitecture');
  const [cpuArchOpen, setCpuArchOpen] = React.useState(false);
  const fieldId = getFieldId(name, 'input');
  const { setValue: setUserManagedNetworking } = useFormikHelpers<boolean>('userManagedNetworking');

  const onCpuArchSelect = (e?: React.SyntheticEvent<HTMLDivElement>) => {
    const val = e?.currentTarget.id as SupportedCpuArchitecture;
    setValue(val);
    setUserManagedNetworking(val === CpuArchitecture.s390x);

    setCpuArchOpen(false);
  };

  return !isDisabled ? (
    <FormGroup isInline fieldId={fieldId} label={t('ai:CPU architecture')} required>
      <Dropdown
        toggle={
          <DropdownToggle onToggle={() => setCpuArchOpen(!cpuArchOpen)} className="pf-u-w-100">
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
