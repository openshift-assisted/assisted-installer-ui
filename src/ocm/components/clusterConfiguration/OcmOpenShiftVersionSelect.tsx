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
import { TFunction } from 'i18next';
import openshiftVersionData from '../../data/openshiftVersionsData';
import { diffInDaysBetweenDates } from '../../../common/sevices/DateAndTime';
import { OpenShiftVersionDropdown } from '../../../common/components/ui/OpenShiftVersionDropown';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { OPENSHIFT_LIFE_CYCLE_DATES_LINK, OpenshiftVersionOptionType } from '../../../common';
import { ocmClient } from '../../api';

const OpenShiftLifeCycleDatesLink = () => {
  const { t } = useTranslation();
  return (
    <a href={OPENSHIFT_LIFE_CYCLE_DATES_LINK} target="_blank" rel="noopener noreferrer">
      {t('ai:Learn more')} <ExternalLinkAltIcon />
    </a>
  );
};

const getOpenshiftVersionHelperText = (
  versions: OpenshiftVersionOptionType[],
  selectedVersionValue: string | undefined,
  t: TFunction,
) => {
  if (!versions.length) {
    return (
      <>
        <ExclamationCircleIcon color={dangerColor.value} size="sm" />
        &nbsp; {t('ai:No release image is available.')}
      </>
    );
  }
  let helperTextComponent = null;
  const selectedVersion = versions.find((version) => version.label === selectedVersionValue);
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

type OcmOpenShiftVersionSelectProps = {
  versions: OpenshiftVersionOptionType[];
};
const OcmOpenShiftVersionSelect = ({ versions }: OcmOpenShiftVersionSelectProps) => {
  const { t } = useTranslation();
  const selectOptions = React.useMemo(
    () =>
      versions
        .filter((version) => version.supportLevel !== 'maintenance')
        .map((version) => ({
          label:
            version.supportLevel === 'beta'
              ? version.label + ' - ' + t('ai:Developer preview release')
              : version.label,
          // This is the "key" from openshift-versions API response
          // It can either be in the long or short (for default versions) form
          value: version.value,
        })),
    [versions, t],
  );
  const defaultVersion = versions.find((v) => v.default)?.label || versions[0]?.label || '';

  return (
    <OpenShiftVersionDropdown
      name="openshiftVersion"
      defaultValue={defaultVersion}
      items={selectOptions}
      isDisabled={versions.length === 0}
      versions={versions}
      getHelperText={getOpenshiftVersionHelperText}
      showReleasesLink={ocmClient !== undefined}
    />
  );
};

export default OcmOpenShiftVersionSelect;
