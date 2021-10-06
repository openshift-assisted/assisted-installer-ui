import React from 'react';
import { useFormikContext } from 'formik';
import { ExclamationTriangleIcon, ExternalLinkAltIcon } from '@patternfly/react-icons';
import { global_warning_color_100 as warningColor } from '@patternfly/react-tokens';
import { OPENSHIFT_LIFE_CYCLE_DATES_LINK } from '../../config';
import { ClusterCreateParams } from '../../api';
import { OpenshiftVersionOptionType } from '../../types';
import { isSNOSupportedVersion, SelectField, isSNOSupportedVersionValue } from '../ui';

const OpenShiftLifeCycleDatesLink = () => (
  <a href={OPENSHIFT_LIFE_CYCLE_DATES_LINK} target="_blank" rel="noopener noreferrer">
    {'Learn more'} <ExternalLinkAltIcon />
  </a>
);

const getOpenshiftVersionHelperText = (versions: OpenshiftVersionOptionType[]) => (
  selectedVersionValue: string,
) => {
  let helperTextComponent = null;
  const selectedVersion = versions.find((version) => version.value === selectedVersionValue);
  if (selectedVersion?.supportLevel !== 'production') {
    helperTextComponent = (
      <>
        <ExclamationTriangleIcon color={warningColor.value} size="sm" />
        &nbsp;Please note that this version is not production ready.
      </>
    );
  } else if (selectedVersion.value === '4.7') {
    helperTextComponent = (
      <>
        <ExclamationTriangleIcon color={warningColor.value} size="sm" />
        &nbsp;
        {
          "Full support for this version ends on August 27th 2021 and won't be available as an installation option afterwards."
        }
        &nbsp;
        <OpenShiftLifeCycleDatesLink />
      </>
    );
  }

  return helperTextComponent;
};

type OpenShiftVersionSelectProps = {
  versions: OpenshiftVersionOptionType[];
};
const OpenShiftVersionSelect: React.FC<OpenShiftVersionSelectProps> = ({ versions }) => {
  const {
    values: { highAvailabilityMode, openshiftVersion },
    setFieldValue,
  } = useFormikContext<ClusterCreateParams>();
  React.useEffect(() => {
    if (highAvailabilityMode === 'None' && !isSNOSupportedVersionValue(openshiftVersion)) {
      const firstSupportedVersionValue = versions.find(isSNOSupportedVersion)?.value;
      setFieldValue('openshiftVersion', firstSupportedVersionValue);
    }
  }, [highAvailabilityMode, openshiftVersion, setFieldValue, versions]);

  const selectOptions = React.useMemo(
    () =>
      versions
        .filter((version) => highAvailabilityMode !== 'None' || isSNOSupportedVersion(version))
        .map((version) => ({
          label: version.label,
          value: version.value,
        })),
    [versions, highAvailabilityMode],
  );

  return (
    <SelectField
      label="OpenShift version"
      name="openshiftVersion"
      options={selectOptions}
      getHelperText={getOpenshiftVersionHelperText(versions)}
      isDisabled={versions.length === 0}
      isRequired
    />
  );
};

export default OpenShiftVersionSelect;
