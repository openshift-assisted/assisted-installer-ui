import * as React from 'react';
import { useField, useFormikContext } from 'formik';
import { Checkbox } from '@patternfly/react-core';
import { useFeature } from '../../../features';
import { OpenshiftVersionOptionType } from '../../../types';
import { getFieldId } from './utils';
import HelperText from './HelperText';
import { CheckboxFieldProps } from './types';
import { isSNOSupportedVersion } from '../utils';
import { FeatureSupportLevelBadge } from '../../featureSupportLevels';
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
  const fieldId = getFieldId(props.name, 'input', idPostfix);

  const { value } = meta;
  const { setValue } = helpers;

  const isSupportedVersionAvailable = !!versions.find(isSNOSupportedVersion);

  if (isSingleNodeOpenshiftEnabled && isSupportedVersionAvailable) {
    return (
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
        onChange={(checked) => setValue(checked ? 'None' : 'Full')}
      />
    );
  }
  return null;
};

export default SingleNodeCheckbox;
