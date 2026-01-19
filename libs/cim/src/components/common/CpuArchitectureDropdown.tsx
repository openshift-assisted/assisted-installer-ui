import * as React from 'react';
import { Dropdown, DropdownItem, FormGroup, MenuToggle } from '@patternfly/react-core';
import { useTranslation } from '@openshift-assisted/common/hooks/use-translation-wrapper';
import {
  architectureData,
  CpuArchitecture,
  getFieldId,
  StaticField,
  SupportedCpuArchitecture,
} from '@openshift-assisted/common';
import { useField } from 'formik';
import { useFormikHelpers } from '@openshift-assisted/common/hooks/useFormikHelpers';

const cimCpuArchitectures = [
  CpuArchitecture.x86,
  CpuArchitecture.ARM,
  CpuArchitecture.s390x,
] as SupportedCpuArchitecture[];

const CpuArchitectureDropdown = ({
  isDisabled = false,
  cpuArchitectures,
}: {
  isDisabled?: boolean;
  cpuArchitectures?: SupportedCpuArchitecture[];
}) => {
  const { t } = useTranslation();
  const [{ name, value }, , { setValue }] = useField<SupportedCpuArchitecture | ''>(
    'cpuArchitecture',
  );
  const [cpuArchOpen, setCpuArchOpen] = React.useState(false);
  const fieldId = getFieldId(name, 'input');
  const { setValue: setUserManagedNetworking } = useFormikHelpers<boolean>('userManagedNetworking');

  const onCpuArchSelect = (e?: React.MouseEvent<Element, MouseEvent>) => {
    const val = e?.currentTarget.id as SupportedCpuArchitecture;
    setValue(val);
    setUserManagedNetworking(val === CpuArchitecture.s390x);

    setCpuArchOpen(false);
  };

  const dropdownItems = React.useMemo(
    () =>
      cimCpuArchitectures.map((arch) => {
        const isItemEnabled = !cpuArchitectures || cpuArchitectures.includes(arch);
        const disabledReason = t(
          'ai:This option is not available with the selected OpenShift version',
        );
        return (
          <DropdownItem
            key={arch}
            id={arch}
            isAriaDisabled={!isItemEnabled}
            selected={arch === value}
            description={architectureData[arch].description}
            tooltipProps={{ content: disabledReason, position: 'top', hidden: isItemEnabled }}
            onClick={(e: React.MouseEvent) => e.preventDefault()}
          >
            {architectureData[arch].label}
          </DropdownItem>
        );
      }),
    [cpuArchitectures, t, value],
  );

  React.useEffect(() => {
    if (!isDisabled && value !== '' && cpuArchitectures && !cpuArchitectures?.includes(value)) {
      const defaultVal = cpuArchitectures?.[0] || CpuArchitecture.x86;
      setValue(defaultVal);
    }
  }, [cpuArchitectures, isDisabled, setValue, value]);

  return !isDisabled ? (
    <FormGroup
      isInline
      id={`form-control__${fieldId}`}
      label={t('ai:CPU architecture')}
      isRequired
      name={'cpuArchiteture'}
    >
      <Dropdown
        id={`${fieldId}-dropdown`}
        toggle={(toggleRef) => (
          <MenuToggle
            id={fieldId}
            ref={toggleRef}
            onClick={() => setCpuArchOpen(!cpuArchOpen)}
            className="pf-v6-u-w-100"
          >
            {value ? architectureData[value].label : t('ai:CPU architecture')}
          </MenuToggle>
        )}
        isOpen={cpuArchOpen}
        onSelect={onCpuArchSelect}
        onOpenChange={() => setCpuArchOpen(!cpuArchOpen)}
      >
        {dropdownItems}
      </Dropdown>
    </FormGroup>
  ) : (
    <StaticField name={'cpuArchitecture'} label={t('ai:CPU architecture')} isRequired>
      {architectureData[value as SupportedCpuArchitecture].label}
    </StaticField>
  );
};

export default CpuArchitectureDropdown;
