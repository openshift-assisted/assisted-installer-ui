import * as React from 'react';
import { Icon } from '@patternfly/react-core';
import { OPENSHIFT_LIFE_CYCLE_DATES_LINK, OpenshiftVersionOptionType } from '../../../common';
import { TFunction } from 'i18next';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';

import { useTranslation } from '../../../common/hooks/use-translation-wrapper';

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
        <Icon status="danger" size="sm">
          <ExclamationCircleIcon />
        </Icon>
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
        <Icon status="warning">
          <ExclamationTriangleIcon />
        </Icon>
        &nbsp;
        {messageSelectedVersion}&nbsp;
        <OpenShiftLifeCycleDatesLink />
      </>
    );
  }

  return null;
};
