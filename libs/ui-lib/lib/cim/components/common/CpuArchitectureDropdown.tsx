import * as React from 'react';
import { FormGroup } from '@patternfly/react-core';
import { Dropdown, DropdownItem, DropdownToggle } from '@patternfly/react-core/deprecated';
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

const allDropdownItems = {
  [CpuArchitecture.x86]: (
    <DropdownItem key={'x86_64'} id="x86_64" description={architectureData['x86_64'].description}>
      {architectureData['x86_64'].label}
    </DropdownItem>
  ),
  [CpuArchitecture.ARM]: (
    <DropdownItem key={'arm64'} id="arm64" description={architectureData['arm64'].description}>
      {architectureData['arm64'].label}
    </DropdownItem>
  ),
  [CpuArchitecture.s390x]: (
    <DropdownItem key={'s390x'} id="s390x" description={architectureData['s390x'].description}>
      {architectureData['s390x'].label}
    </DropdownItem>
  ),
};

const CpuArchitectureDropdown = ({
  isDisabled = false,
  cpuArchitectures,
}: {
  isDisabled?: boolean;
  cpuArchitectures?: string[];
}) => {
  const { t } = useTranslation();
  const [{ name, value }, , { setValue }] = useField<SupportedCpuArchitecture | ''>(
    'cpuArchitecture',
  );
  const [cpuArchOpen, setCpuArchOpen] = React.useState(false);
  const fieldId = getFieldId(name, 'input');
  const { setValue: setUserManagedNetworking } = useFormikHelpers<boolean>('userManagedNetworking');

  const onCpuArchSelect = (e?: React.SyntheticEvent<HTMLDivElement>) => {
    const val = e?.currentTarget.id as SupportedCpuArchitecture;
    setValue(val);
    setUserManagedNetworking(val === CpuArchitecture.s390x);

    setCpuArchOpen(false);
  };

  const dropdownItems = React.useMemo(() => {
    if (!cpuArchitectures) {
      return Object.values(allDropdownItems);
    } else {
      return Object.entries(allDropdownItems)
        .filter(([key, _]) => cpuArchitectures.includes(key))
        .map(([_, val]) => val);
    }
  }, [cpuArchitectures]);

  React.useEffect(() => {
    if (!isDisabled && value !== '' && cpuArchitectures && !cpuArchitectures?.includes(value)) {
      setValue('');
    }
  }, [cpuArchitectures, isDisabled, setValue, value]);

  return !isDisabled ? (
    <FormGroup isInline fieldId={fieldId} label={t('ai:CPU architecture')} isRequired>
      <Dropdown
        toggle={
          <DropdownToggle onToggle={() => setCpuArchOpen(!cpuArchOpen)} className="pf-u-w-100">
            {value ? architectureData[value].label : t('ai:CPU architecture')}
          </DropdownToggle>
        }
        name="cpuArchitecture"
        isOpen={cpuArchOpen}
        onSelect={onCpuArchSelect}
        dropdownItems={dropdownItems}
        className="pf-u-w-100"
      />
    </FormGroup>
  ) : (
    <StaticField name={'cpuArchitecture'} label={t('ai:CPU architecture')} isRequired>
      {architectureData[value as SupportedCpuArchitecture].label}
    </StaticField>
  );
};

export default CpuArchitectureDropdown;
