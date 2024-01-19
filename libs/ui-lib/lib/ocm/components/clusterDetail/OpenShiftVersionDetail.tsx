import React from 'react';
import { getOpenshiftVersionText } from '../../../common';
import { useOpenshiftVersions } from '../../hooks';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import { Icon, Popover, Text, TextContent, TextVariants } from '@patternfly/react-core';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';

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
        <Icon size="sm" status="warning">
          <ExclamationTriangleIcon />
        </Icon>
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
