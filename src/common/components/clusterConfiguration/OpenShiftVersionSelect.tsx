import React from 'react';
import {
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  ExternalLinkAltIcon,
} from '@patternfly/react-icons';
import {
  global_warning_color_100 as warningColor,
  global_danger_color_100 as dangerColor,
} from '@patternfly/react-tokens';
import { OPENSHIFT_LIFE_CYCLE_DATES_LINK } from '../../config';
import { OpenshiftVersionOptionType } from '../../types';
import { SelectField } from '../ui';
// eslint-disable-next-line no-restricted-imports
import openshiftVersionData from '../../../ocm/data/openshiftVersionsData';
import { diffInDaysBetweenDates } from '../../sevices/DateAndTime';
import { useTranslation } from '../../hooks/use-translation-wrapper';

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
    let helperTextComponent = null;
    const selectedVersion = versions.find((version) => version.value === selectedVersionValue);
    if (!selectedVersionValue || !selectedVersion) {
      return null;
    }

    if (selectedVersion.supportLevel !== 'production') {
      helperTextComponent = (
        <>
          <ExclamationTriangleIcon color={warningColor.value} size="sm" />
          &nbsp;{t('ai:Please note that this version is not production-ready.')}&nbsp;
          <OpenShiftLifeCycleDatesLink />
        </>
      );
    }

    const versionSupportEndDate = openshiftVersionData.versions[selectedVersionValue];
    const showSupportEndWarning =
      versionSupportEndDate && diffInDaysBetweenDates(versionSupportEndDate) <= 30;

    if (showSupportEndWarning) {
      helperTextComponent = (
        <>
          <ExclamationTriangleIcon color={warningColor.value} size="sm" />
          &nbsp;
          {t(
            "ai:Full support for this version ends on {{openshiftversion}} and won't be available as an installation option afterwards.",
            { openshiftversion: versionSupportEndDate },
          )}
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
    />
  );
};

export default OpenShiftVersionSelect;
