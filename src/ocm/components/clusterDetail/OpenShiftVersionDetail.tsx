import React from 'react';
import { Cluster, DetailItem } from '../../../common';
import { useOpenshiftVersions } from '../../hooks';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import { global_warning_color_100 as warningColor } from '@patternfly/react-tokens/dist/js/global_warning_color_100';
import { Popover, Text, TextContent, TextVariants } from '@patternfly/react-core';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';

const UnsupportedVersion = ({ version }: { version: string }) => {
  const { t } = useTranslation();

  const hint = (
    <TextContent>
      <Text component={TextVariants.p}>
        {t('ai:Please note that this version is not production-ready.')}
      </Text>
    </TextContent>
  );
  return (
    <Text component="p">
      {version} &nbsp;
      <Popover bodyContent={hint}>
        <ExclamationTriangleIcon color={warningColor.value} size="sm" />
      </Popover>
    </Text>
  );
};

const OpenShiftVersionDetail = ({ cluster }: { cluster: Cluster }) => {
  const { isSupportedOpenShiftVersion } = useOpenshiftVersions();
  const { t } = useTranslation();
  const { openshiftVersion: version } = cluster;
  const isSupported = isSupportedOpenShiftVersion(version);
  return (
    <DetailItem
      title={t('ai:OpenShift version')}
      value={isSupported ? version : <UnsupportedVersion version={version || ''} />}
      testId="openshift-version"
    />
  );
};

export default OpenShiftVersionDetail;
