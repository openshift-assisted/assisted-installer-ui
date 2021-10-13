import React from 'react';
import { useFormikContext } from 'formik';
import { ExclamationTriangleIcon, ExternalLinkAltIcon } from '@patternfly/react-icons';
import { global_warning_color_100 as warningColor } from '@patternfly/react-tokens';
import { OPENSHIFT_LIFE_CYCLE_DATES_LINK } from '../../config';
import { ClusterCreateParams } from '../../api';
import { OpenshiftVersionOptionType } from '../../types';
import { isSNOSupportedVersion, SelectField } from '../ui';

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
        &nbsp;Please note that this version is not production ready. <OpenShiftLifeCycleDatesLink />
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

  const selectedVersion = versions.find((v) => v.value === openshiftVersion) || versions[0];
  React.useEffect(() => {
    if (highAvailabilityMode === 'None' && !isSNOSupportedVersion(selectedVersion)) {
      const firstSupportedVersionValue = versions.find(isSNOSupportedVersion)?.value;
      setFieldValue('openshiftVersion', firstSupportedVersionValue);
    }
  }, [highAvailabilityMode, selectedVersion, setFieldValue, versions]);

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
