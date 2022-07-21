import * as React from 'react';
import { useField, useFormikContext } from 'formik';
import { Checkbox, FormGroup, Tooltip } from '@patternfly/react-core';
import { useFeature } from '../../../features';
import { OpenshiftVersionOptionType } from '../../../types';
import { getFieldId } from './utils';
import HelperText from './HelperText';
import { CheckboxFieldProps } from './types';
import { FeatureSupportLevelBadge, useFeatureSupportLevel } from '../../featureSupportLevels';
import { ClusterCreateParams } from '../../../api/types';
import { useTranslation } from '../../../hooks/use-translation-wrapper';

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
  const featureSupportLevelContext = useFeatureSupportLevel();
  const prevVersionRef = React.useRef(openshiftVersion);
  const fieldId = getFieldId(props.name, 'input', idPostfix);
  const { t } = useTranslation();
  const { value } = meta;
  const { setValue } = helpers;
  const isSupportedVersionAvailable = !!versions.find((version) =>
    featureSupportLevelContext.isFeatureSupported(version.value, 'SNO'),
  );
  const onChanged = React.useCallback(
    (checked: boolean) => setValue(checked ? 'None' : 'Full'),
    [setValue],
  );

  const disabledReason = featureSupportLevelContext.getFeatureDisabledReason(
    openshiftVersion,
    'SNO',
    t,
  );

  React.useEffect(() => {
    if (
      prevVersionRef.current !== openshiftVersion &&
      !featureSupportLevelContext.isFeatureSupported(openshiftVersion, 'SNO')
    ) {
      //invoke updating SNO value only if the version changed to not be in danger of touching existing clusters
      onChanged(false);
    }
    prevVersionRef.current = openshiftVersion;
  }, [openshiftVersion, onChanged, featureSupportLevelContext]);

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
                {t('ai:Install single node OpenShift (SNO)')}&nbsp;
                <FeatureSupportLevelBadge featureId="SNO" openshiftVersion={openshiftVersion} />
              </>
            }
            aria-describedby={`${fieldId}-helper`}
            description={
              <HelperText fieldId={fieldId}>
                {t('ai:SNO enables you to install OpenShift using only one host.')}
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
