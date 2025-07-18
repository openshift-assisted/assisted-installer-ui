import * as React from 'react';
import { useField, useFormikContext } from 'formik';
import {
  Checkbox,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Tooltip,
} from '@patternfly/react-core';
import { OpenshiftVersionOptionType } from '../../../types';
import { getFieldId } from './utils';
import { CheckboxFieldProps } from './types';
import { FeatureSupportLevelBadge, useFeatureSupportLevel } from '../../featureSupportLevels';
import { ClusterCreateParams } from '@openshift-assisted/types/assisted-installer-service';
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

  if (isSupportedVersionAvailable) {
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
              <FormGroup>
                <FormHelperText>
                  <HelperText id={fieldId}>
                    <HelperTextItem data-testid={`input-singlenodecheckbox-${fieldId}-helper-text`}>
                      {t('ai:SNO enables you to install OpenShift using only one host.')}
                    </HelperTextItem>
                  </HelperText>
                </FormHelperText>
              </FormGroup>
            }
            isChecked={value === 'None'}
            onChange={(_event, value) => onChanged(value)}
            className="with-tooltip"
          />
        </Tooltip>
      </FormGroup>
    );
  }
  return null;
};

export default SingleNodeCheckbox;
