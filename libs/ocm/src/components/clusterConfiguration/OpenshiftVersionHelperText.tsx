import * as React from 'react';
import {
  OPENSHIFT_LIFE_CYCLE_DATES_LINK,
  OpenshiftVersionOptionType,
  UiIcon,
} from '@openshift-assisted/common';
import { TFunction } from 'i18next';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';

import { useTranslation } from '@openshift-assisted/common/hooks/use-translation-wrapper';

const OpenShiftLifeCycleDatesLink = () => {
  const { t } = useTranslation();
  return (
    <a href={OPENSHIFT_LIFE_CYCLE_DATES_LINK} target="_blank" rel="noopener noreferrer">
      {t('ai:Learn more')} <ExternalLinkAltIcon />
    </a>
  );
};

export const getOpenshiftVersionHelperText = (
  versions: OpenshiftVersionOptionType[],
  selectedVersionValue: string | null,
  t: TFunction,
  isModal?: boolean,
) => {
  if (!versions.length && !isModal) {
    return (
      <>
        <UiIcon status="danger" size="sm" icon={<ExclamationCircleIcon />} />
        &nbsp; {t('ai:No release image is available.')}
      </>
    );
  }

  const selectedVersion = versions.find((version) => version.value === selectedVersionValue);
  if (!selectedVersionValue || !selectedVersion) {
    return null;
  }

  if (
    selectedVersion.supportLevel !== 'production' &&
    selectedVersion.supportLevel !== 'maintenance'
  ) {
    let messageSelectedVersion = t('ai:Please note that this version is not production-ready.');
    if (selectedVersion.supportLevel === 'end-of-life') {
      messageSelectedVersion = t('ai:Please note that this version is not maintained anymore.');
    }
    return (
      <>
        <UiIcon status="warning" icon={<ExclamationTriangleIcon />} />
        &nbsp;
        {messageSelectedVersion}&nbsp;
        <OpenShiftLifeCycleDatesLink />
      </>
    );
  }

  return null;
};
