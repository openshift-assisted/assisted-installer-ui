import * as React from 'react';
import { FormGroup, Tooltip } from '@patternfly/react-core';
import { useField, useFormikContext } from 'formik';
import {
  getFieldId,
  isArmArchitecture,
  ClusterCreateParams,
  HelperText,
  PopoverIcon,
  CpuArchitecture,
  OpenshiftVersionOptionType,
} from '../../../common';
import {
  FeatureSupportLevelBadge,
  useFeatureSupportLevel,
} from '../../../common/components/featureSupportLevels';
import { OcmCheckbox } from '../ui/OcmFormFields';

const getLabel = (openshiftVersion: string) => {
  return (
    <>
      Use arm64 CPU architecture{' '}
      <PopoverIcon
        noVerticalAlign
        bodyContent={
          <p>
            Check this option if you want to use the arm64 CPU architecture instead of the default
            x86_64 CPU architecture. Please note that some features will not be available.
          </p>
        }
      />
      <FeatureSupportLevelBadge
        featureId="ARM64_ARCHITECTURE"
        openshiftVersion={openshiftVersion}
      />
    </>
  );
};

type ArmCheckboxProps = { versions: OpenshiftVersionOptionType[] };

const ArmCheckbox: React.FC<ArmCheckboxProps> = ({ versions }) => {
  const {
    values: { openshiftVersion },
  } = useFormikContext<ClusterCreateParams>();
  const [{ name, value }, , { setValue }] = useField<CpuArchitecture>('cpuArchitecture');
  const featureSupportLevelContext = useFeatureSupportLevel();
  const isSupportedVersionAvailable = !!versions.find((version) =>
    featureSupportLevelContext.isFeatureSupported(version.value, 'ARM64_ARCHITECTURE'),
  );
  const prevVersionRef = React.useRef(openshiftVersion);
  const fieldId = getFieldId(name, 'input');
  const onChanged = React.useCallback(
    (checked: boolean) => setValue(checked ? CpuArchitecture.ARM : CpuArchitecture.x86),
    [setValue],
  );

  React.useEffect(() => {
    if (
      prevVersionRef.current !== openshiftVersion &&
      !featureSupportLevelContext.isFeatureSupported(openshiftVersion, 'ARM64_ARCHITECTURE')
    ) {
      //invoke updating cpu architecture value only if the version changed to not be in danger of touching existing clusters
      onChanged(false);
    }
    prevVersionRef.current = openshiftVersion;
  }, [openshiftVersion, onChanged, featureSupportLevelContext]);
  if (!isSupportedVersionAvailable) {
    return null;
  }
  const disabledReason = featureSupportLevelContext.getFeatureDisabledReason(
    openshiftVersion,
    'ARM64_ARCHITECTURE',
  );
  return (
    <FormGroup isInline fieldId={fieldId}>
      <Tooltip hidden={!disabledReason} content={disabledReason}>
        <OcmCheckbox
          id={fieldId}
          name={name}
          isDisabled={featureSupportLevelContext.isFeatureDisabled(
            openshiftVersion,
            'ARM64_ARCHITECTURE',
          )}
          label={getLabel(openshiftVersion)}
          aria-describedby={`${fieldId}-helper`}
          description={
            <HelperText fieldId={fieldId}>
              Make sure all the hosts are using arm64 CPU architecture.
            </HelperText>
          }
          isChecked={isArmArchitecture({ cpuArchitecture: value })}
          onChange={onChanged}
          className="with-tooltip"
        />
      </Tooltip>
    </FormGroup>
  );
};

export default ArmCheckbox;
