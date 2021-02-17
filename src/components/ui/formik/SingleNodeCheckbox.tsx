import * as React from 'react';
import { useField } from 'formik';
import { Checkbox } from '@patternfly/react-core';
import { CheckboxFieldProps } from './types';
import { getFieldId } from './utils';
import HelperText from './HelperText';
import { useFeature } from '../../../features/featureGate';
import { OpenshiftVersionOptionType } from '../../../types/versions';
import { SNO_SUPPORT_MIN_VERSION } from '../../../config/constants';

type SingleNodeCheckboxProps = CheckboxFieldProps & { versions: OpenshiftVersionOptionType[] };

const SingleNodeCheckbox: React.FC<SingleNodeCheckboxProps> = ({
  versions,
  validate,
  idPostfix,
  ...props
}) => {
  const isSingleNodeOpenshiftEnabled = useFeature('ASSISTED_INSTALLER_SNO_FEATURE');
  const [field, meta, helpers] = useField<'None' | 'Full'>({ name: props.name, validate });
  const fieldId = getFieldId(props.name, 'input', idPostfix);

  const { value } = meta;
  const { setValue } = helpers;

  const isSupportedVersionAvailable = !!versions.find(
    (version) => parseFloat(version.value) >= SNO_SUPPORT_MIN_VERSION,
  );

  if (isSingleNodeOpenshiftEnabled && isSupportedVersionAvailable) {
    return (
      <Checkbox
        {...field}
        {...props}
        id={fieldId}
        label="I want to install single node OpenShift (SNO)"
        aria-describedby={`${fieldId}-helper`}
        description={
          <HelperText fieldId={fieldId}>
            {'This enables you to install OpenShift using only 1 host.'}
          </HelperText>
        }
        isChecked={value === 'None'}
        onChange={(checked) => setValue(checked ? 'None' : 'Full')}
      />
    );
  }
  return null;
};

export default SingleNodeCheckbox;
