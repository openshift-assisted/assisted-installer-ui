import React from 'react';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';
import { global_warning_color_100 as warningColor } from '@patternfly/react-tokens/dist/js/global_warning_color_100';
import { global_danger_color_100 as dangerColor } from '@patternfly/react-tokens/dist/js/global_danger_color_100';
import { OPENSHIFT_LIFE_CYCLE_DATES_LINK } from '../../config';
import { OpenshiftVersionOptionType } from '../../types';
import { SelectField } from '../ui';
import { useTranslation } from '../../hooks/use-translation-wrapper';
import { SelectFieldProps } from '../ui/formik/types';

const OpenShiftLifeCycleDatesLink = () => {
  const { t } = useTranslation();
  return (
    <a href={OPENSHIFT_LIFE_CYCLE_DATES_LINK} target="_blank" rel="noopener noreferrer">
      {t('ai:Learn more')} <ExternalLinkAltIcon />
    </a>
  );
};

const getOpenshiftVersionHelperText =
  // eslint-disable-next-line react/display-name
  (versions: OpenshiftVersionOptionType[]) => (selectedVersionValue: string) => {
    const { t } = useTranslation();
    if (!versions.length) {
      return (
        <>
          <ExclamationCircleIcon color={dangerColor.value} size="sm" />
          &nbsp; {t('ai:No release image is available.')}
        </>
      );
    }
    const selectedVersion = versions.find((version) => version.value === selectedVersionValue);
    if (!selectedVersionValue || !selectedVersion) {
      return null;
    }

    if (selectedVersion.supportLevel !== 'production') {
      return (
        <>
          <ExclamationTriangleIcon color={warningColor.value} size="sm" />
          &nbsp;{t('ai:Please note that this version is not production-ready.')}&nbsp;
          <OpenShiftLifeCycleDatesLink />
        </>
      );
    }

    return null;
  };

type OpenShiftVersionSelectProps = {
  versions: OpenshiftVersionOptionType[];
  onChange?: SelectFieldProps['onChange'];
};
const OpenShiftVersionSelect: React.FC<OpenShiftVersionSelectProps> = ({ versions, onChange }) => {
  const selectOptions = React.useMemo(
    () =>
      versions
        .filter((version) => version.supportLevel !== 'maintenance')
        .map((version) => ({
          label: version.label,
          value: version.value,
        })),
    [versions],
  );
  const { t } = useTranslation();
  return (
    <SelectField
      label={t('ai:OpenShift version')}
      name="openshiftVersion"
      options={selectOptions}
      getHelperText={getOpenshiftVersionHelperText(versions)}
      isDisabled={versions.length === 0}
      isRequired
      onChange={onChange}
    />
  );
};

export default OpenShiftVersionSelect;
