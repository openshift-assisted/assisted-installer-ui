import * as React from 'react';
import {
  FormGroup,
  Tooltip,
  Dropdown,
  DropdownItem,
  MenuToggle,
  MenuToggleElement,
  DropdownList,
} from '@patternfly/react-core';
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

  const onOsImageSelect = (
    event?: React.MouseEvent<Element, MouseEvent>,
    val?: string | number,
  ) => {
    setValue(val ? String(val) : '');
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
          toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
            <MenuToggle
              ref={toggleRef}
              isFullWidth
              onClick={() => setOsImageOpen(!osImageOpen)}
              isExpanded={osImageOpen}
              isDisabled={!filteredImages.length}
            >
              {value ? `OpenShift ${value}` : t('ai:No version selected')}
            </MenuToggle>
          )}
          isOpen={osImageOpen}
          onSelect={onOsImageSelect}
          onOpenChange={() => setOsImageOpen(!osImageOpen)}
        >
          <DropdownList>
            {filteredImages.map((image) => (
              <DropdownItem
                key={image.openshiftVersion}
                id={image.openshiftVersion}
                value={image.openshiftVersion}
              >
                {`OpenShift ${image.openshiftVersion}`}
              </DropdownItem>
            ))}
          </DropdownList>
        </Dropdown>
      </Tooltip>
    </FormGroup>
  );
};

export default InfraEnvOpenShiftVersionDropdown;
