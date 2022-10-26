import React from 'react';
import { OpenshiftVersionOptionType } from '../../../common/types';
import { OpenShiftVersionDropdown } from '../../../common/components/ui/OpenShiftVersionDropown';
import {
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  ExternalLinkAltIcon,
} from '@patternfly/react-icons';
import {
  global_warning_color_100 as warningColor,
  global_danger_color_100 as dangerColor,
} from '@patternfly/react-tokens';
import openshiftVersionData from '../../data/openshiftVersionsData.json';
import { diffInDaysBetweenDates } from '../../../common/sevices/DateAndTime';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { OPENSHIFT_LIFE_CYCLE_DATES_LINK } from '../../../common/config';
import { TFunction } from 'i18next';
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
  if (selectedVersion?.supportLevel !== 'production') {
    helperTextComponent = (
      <>
        <ExclamationTriangleIcon color={warningColor.value} size="sm" />
        &nbsp;{t('ai:Please note that this version is not production-ready.')}&nbsp;
        <OpenShiftLifeCycleDatesLink />
      </>
    );
  } else if (
    selectedVersionValue &&
    selectedVersionValue in openshiftVersionData['versions'] &&
    diffInDaysBetweenDates(openshiftVersionData['versions'][selectedVersionValue] as string) <= 30
  ) {
    helperTextComponent = (
      <>
        <ExclamationTriangleIcon color={warningColor.value} size="sm" />
        &nbsp;
        {t(
          "ai:Full support for this version ends on {{openshiftversion}} and won't be available as an installation option afterwards.",
          { openshiftversion: openshiftVersionData['versions'][selectedVersionValue] as string },
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
const OcmOpenShiftVersionSelect: React.FC<OcmOpenShiftVersionSelectProps> = ({ versions }) => {
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
