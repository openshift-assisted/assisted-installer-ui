import React from 'react';
import { Cluster, getOpenshiftVersionText } from '../../../common';
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
  const { openshiftVersion } = cluster;
  const { isSupportedOpenShiftVersion, versions } = useOpenshiftVersions();
  const isSupported = isSupportedOpenShiftVersion(openshiftVersion);

  const version = React.useMemo(() => {
    return getOpenshiftVersionText({
      versions,
      openshiftVersion: openshiftVersion || '',
      cpuArchitecture: cluster.cpuArchitecture,
      withPreviewText: true,
      withMultiText: true,
    });
  }, [versions, cluster.cpuArchitecture, openshiftVersion]);

  return isSupported ? <>{version}</> : <UnsupportedVersion version={version || ''} />;
};

export default OpenShiftVersionDetail;
