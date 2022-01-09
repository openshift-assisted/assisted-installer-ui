import * as React from 'react';
import { useField, useFormikContext } from 'formik';
import { Checkbox, FormGroup, Tooltip } from '@patternfly/react-core';
import { useFeature } from '../../../features';
import { OpenshiftVersionOptionType } from '../../../types';
import { getFieldId } from './utils';
import HelperText from './HelperText';
import { CheckboxFieldProps } from './types';
import { FeatureSupportLevelBadge, FeatureSupportLevelContext } from '../../featureSupportLevels';
import { ClusterCreateParams } from '../../../api/types';

type SingleNodeCheckboxProps = CheckboxFieldProps & { versions: OpenshiftVersionOptionType[] };

const SingleNodeCheckbox: React.FC<SingleNodeCheckboxProps> = ({
  versions,
  validate,
  idPostfix,
  ...props
}) => {
  const {
    values: { openshiftVersion },
  } = useFormikContext<ClusterCreateParams>();
  const isSingleNodeOpenshiftEnabled = useFeature('ASSISTED_INSTALLER_SNO_FEATURE');
  const [field, meta, helpers] = useField<'None' | 'Full'>({ name: props.name, validate });
  const { getFeatureDisabledReason, isFeatureSupported } = React.useContext(
    FeatureSupportLevelContext,
  );
  const prevVersionRef = React.useRef(openshiftVersion);
  const fieldId = getFieldId(props.name, 'input', idPostfix);

  const { value } = meta;
  const { setValue } = helpers;
  const isSupportedVersionAvailable = !!versions.find((version) =>
    isFeatureSupported(version.value, 'SNO'),
  );
  const onChanged = React.useCallback((checked: boolean) => setValue(checked ? 'None' : 'Full'), [
    setValue,
  ]);

  const disabledReason = getFeatureDisabledReason(openshiftVersion, 'SNO');

  React.useEffect(() => {
    if (
      prevVersionRef.current !== openshiftVersion &&
      !isFeatureSupported(openshiftVersion, 'SNO')
    ) {
      //invoke updating SNO value only if the version changed to not be in danger of touching existing clusters
      onChanged(false);
    }
    prevVersionRef.current = openshiftVersion;
  }, [openshiftVersion, onChanged, isFeatureSupported]);

  if (isSingleNodeOpenshiftEnabled && isSupportedVersionAvailable) {
    return (
      <FormGroup isInline fieldId={fieldId}>
        <Tooltip hidden={!disabledReason} content={disabledReason}>
          <Checkbox
            {...field}
            {...props}
            id={fieldId}
            label={
              <>
                Install single node OpenShift (SNO)
                <FeatureSupportLevelBadge
                  featureId="SNO"
                  openshiftVersion={openshiftVersion}
                ></FeatureSupportLevelBadge>
              </>
            }
            aria-describedby={`${fieldId}-helper`}
            description={
              <HelperText fieldId={fieldId}>
                SNO enables you to install OpenShift using only one host.
              </HelperText>
            }
            isChecked={value === 'None'}
            onChange={onChanged}
            className="with-tooltip"
          />
        </Tooltip>
      </FormGroup>
    );
  }
  return null;
};

export default SingleNodeCheckbox;
