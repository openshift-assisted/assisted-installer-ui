import * as React from 'react';
import { Dropdown, DropdownItem, Button, FormGroup, Tooltip } from '@patternfly/react-core';
import { useField } from 'formik';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { architectureData, getFieldId, SupportedCpuArchitecture } from '../../../common';
import { OsImage } from '../../types';

const InfraEnvOpenShiftVersionDropdown = ({ osImages }: { osImages: OsImage[] }) => {
  const { t } = useTranslation();
  const [{ name, value }, , { setValue }] = useField<string>('osImageVersion');
  const [{ value: cpuArchitecture }] = useField<string>('cpuArchitecture');
  const [isOpen, setIsOpen] = React.useState(false);
  const fieldId = getFieldId(name, 'input');

  const filteredImages = React.useMemo(
    () => osImages.filter((image) => image.cpuArchitecture === cpuArchitecture),
    [osImages, cpuArchitecture],
  );

  React.useEffect(() => {
    if (filteredImages.length === 0 && value !== '') {
      setValue('');
    }
  }, [filteredImages.length, setValue, value]);

  const onSelect = (
    event: React.MouseEvent | React.KeyboardEvent | undefined,
    value: string | number | undefined,
  ) => {
    // Since openshiftVersion is a string, convert value to string or use empty string
    setValue(typeof value === 'string' ? value : '');
    setIsOpen(false);
  };

  const onToggle = (isOpen: boolean) => {
    setIsOpen(isOpen);
  };

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
          onSelect={onSelect}
          toggle={(toggleRef) => (
            <Button
              variant="control"
              onClick={() => setIsOpen(!isOpen)}
              isDisabled={!filteredImages.length}
              ref={toggleRef}
              className="pf-u-w-100"
            >
              {value ? `OpenShift ${value}` : t('ai:No version selected')}
            </Button>
          )}
          isOpen={isOpen}
          className="pf-u-w-100"
        >
          <DropdownItem key="NO_VALUE" value="">
            {t('ai:No version selected')}
          </DropdownItem>
          {filteredImages.map((image) => (
            <DropdownItem key={image.openshiftVersion} value={image.openshiftVersion}>
              {`OpenShift ${image.openshiftVersion}`}
            </DropdownItem>
          ))}
        </Dropdown>
      </Tooltip>
    </FormGroup>
  );
};

export default InfraEnvOpenShiftVersionDropdown;
