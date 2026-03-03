import React from 'react';
import { Popover, Content, ContentVariants, Icon } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';

import { Cluster } from '@openshift-assisted/types/assisted-installer-service';
import { getOpenshiftVersionText } from '../../../common';
import { useOpenShiftVersionsContext } from '../clusterWizard/OpenShiftVersionsContext';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';

const UnsupportedVersion = ({ version }: { version: string }) => {
  const { t } = useTranslation();

  const hint = (
    <Content component={ContentVariants.p}>
      {t('ai:Please note that this version is not production-ready.')}
    </Content>
  );
  return (
    <Content component="p">
      {version} &nbsp;
      <Popover bodyContent={hint}>
        <Icon size="sm" status="warning">
          <ExclamationTriangleIcon />
        </Icon>
      </Popover>
    </Content>
  );
};

const OpenShiftVersionDetail = ({ cluster }: { cluster: Cluster }) => {
  const { openshiftVersion } = cluster;
  const { isSupportedOpenShiftVersion, latestVersions: versions } = useOpenShiftVersionsContext();
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
