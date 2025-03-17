import * as React from 'react';
import { Dropdown, DropdownItem, DropdownToggle } from '@patternfly/react-core/deprecated';
import { FormGroup, Tooltip } from '@patternfly/react-core';
import { useField } from 'formik';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { architectureData, getFieldId, SupportedCpuArchitecture } from '../../../common';
import { OsImage } from '../../types';

const InfraEnvOpenShiftVersionDropdown = ({ osImages }: { osImages: OsImage[] }) => {
  const { t } = useTranslation();
  const [{ name, value }, , { setValue }] = useField<string>('osImageVersion');
  const [{ value: cpuArchitecture }] = useField<string>('cpuArchitecture');
  const [osImageOpen, setOsImageOpen] = React.useState(false);
  const fieldId = getFieldId(name, 'input');

  const onOsImageSelect = (e?: React.SyntheticEvent<HTMLDivElement>) => {
    const val = e?.currentTarget.id || '';
    setValue(val);
    setOsImageOpen(false);
  };

  const filteredImages = React.useMemo(
    () => osImages.filter((image) => image.cpuArchitecture === cpuArchitecture),
    [osImages, cpuArchitecture],
  );

  React.useEffect(() => {
    if (filteredImages.length === 0 && value !== '') {
      setValue('');
    }
  }, [filteredImages.length, setValue, t, value]);

  return (
    <FormGroup isInline fieldId={fieldId} label={t('ai:OpenShift version')}>
      <Tooltip
        content={t(
          'ai:No OpenShift images available for selected CPU architecture {{cpuArchitecture}}.',
          { cpuArchitecture: architectureData[cpuArchitecture as SupportedCpuArchitecture].label },
        )}
        hidden={!!filteredImages.length}
      >
        <Dropdown
          toggle={
            <DropdownToggle
              onToggle={() => setOsImageOpen(!osImageOpen)}
              className="pf-u-w-100"
              isDisabled={!filteredImages.length}
            >
              {value ? `OpenShift ${value}` : t('ai:No version selected')}
            </DropdownToggle>
          }
          name="osImageVersion"
          isOpen={osImageOpen}
          onSelect={onOsImageSelect}
          dropdownItems={[
            <DropdownItem key={'NO_VALUE'} value={''}>
              {t('ai:No version selected')}
            </DropdownItem>,
            ...filteredImages.map((image) => (
              <DropdownItem key={image.openshiftVersion} id={image.openshiftVersion}>
                {`OpenShift ${image.openshiftVersion}`}
              </DropdownItem>
            )),
          ]}
          className="pf-u-w-100"
        />
      </Tooltip>
    </FormGroup>
  );
};

export default InfraEnvOpenShiftVersionDropdown;
