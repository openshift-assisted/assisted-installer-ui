import React from 'react';
import { UiIcon, getOpenshiftVersionText } from '../../../common';
import { useOpenShiftVersionsContext } from '../clusterWizard/OpenShiftVersionsContext';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import { Popover, Content, ContentVariants } from '@patternfly/react-core';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';

const UnsupportedVersion = ({ version }: { version: string }) => {
  const { t } = useTranslation();

  const hint = (
    <Content>
      <Content component={ContentVariants.p}>
        {t('ai:Please note that this version is not production-ready.')}
      </Content>
    </Content>
  );
  return (
    <Content component="p">
      {version} &nbsp;
      <Popover bodyContent={hint}>
        <UiIcon size="sm" status="warning" icon={<ExclamationTriangleIcon />} />
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
