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
import { getFieldId } from '../../../common';
import { useNewFeatureSupportLevel } from '../../../common/components/newFeatureSupportLevels';
import { CheckboxFieldProps } from '../../../common/components/ui/formik/types';
import NewFeatureSupportLevelBadge from '../../../common/components/newFeatureSupportLevels/NewFeatureSupportLevelBadge';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import {
  ClusterCreateParams,
  SupportLevel,
} from '@openshift-assisted/types/assisted-installer-service';

export interface OcmCheckboxProps extends CheckboxFieldProps {
  disabledReason?: string;
  isSupportedVersionAvailable?: boolean;
  supportLevel?: SupportLevel;
}

const OcmSingleNodeCheckbox: React.FC<OcmCheckboxProps> = ({
  disabledReason,
  isSupportedVersionAvailable,
  validate,
  idPostfix,
  supportLevel,
  ...props
}) => {
  const {
    values: { openshiftVersion },
  } = useFormikContext<ClusterCreateParams>();
  const [field, meta, helpers] = useField<'None' | 'Full'>({ name: props.name, validate });
  const featureSupportLevelContext = useNewFeatureSupportLevel();
  const prevVersionRef = React.useRef(openshiftVersion);
  const prevIsDisabled = React.useRef(props.isDisabled);
  const fieldId = getFieldId(props.name, 'input', idPostfix);
  const { t } = useTranslation();
  const { value } = meta;
  const { setValue } = helpers;

  const onChanged = React.useCallback(
    (checked: boolean) => setValue(checked ? 'None' : 'Full'),
    [setValue],
  );

  React.useEffect(() => {
    if (
      prevVersionRef.current !== openshiftVersion &&
      !featureSupportLevelContext.isFeatureSupported('SNO')
    ) {
      //invoke updating SNO value only if the version changed to not be in danger of touching existing clusters
      onChanged(false);
    }
    prevVersionRef.current = openshiftVersion;
  }, [openshiftVersion, onChanged, featureSupportLevelContext]);

  React.useEffect(() => {
    if (prevIsDisabled.current !== props.isDisabled) {
      onChanged(false);
    }
    prevIsDisabled.current = props.isDisabled;
  }, [props.isDisabled, setValue, onChanged]);

  if (isSupportedVersionAvailable) {
    return (
      <FormGroup id={`form-control__${fieldId}`} isInline fieldId={fieldId}>
        <Tooltip hidden={!disabledReason} content={disabledReason}>
          <Checkbox
            {...field}
            {...props}
            id={fieldId}
            label={
              <>
                {t('ai:Install single node OpenShift (SNO)')}&nbsp;
                <NewFeatureSupportLevelBadge featureId="SNO" supportLevel={supportLevel} />
              </>
            }
            aria-describedby={`${fieldId}-helper`}
            description={
              <FormGroup>
                <FormHelperText>
                  <HelperText id={fieldId}>
                    <HelperTextItem>
                      {t('ai:SNO enables you to install OpenShift using only one host.')}
                    </HelperTextItem>
                  </HelperText>
                </FormHelperText>
              </FormGroup>
            }
            isChecked={value === 'None'}
            onChange={(event, value) => onChanged(value)}
            className="with-tooltip"
          />
        </Tooltip>
      </FormGroup>
    );
  }
  return null;
};

export default OcmSingleNodeCheckbox;
