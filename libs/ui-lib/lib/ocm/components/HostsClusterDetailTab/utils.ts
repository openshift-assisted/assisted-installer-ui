import { OcmClusterType } from '../AddHosts/types';
import { getFeatureSupported } from '../newFeatureSupportLevels/NewFeatureSupportLevelProvider';
import { AddHostsTabState } from './types';

const isSNOExpansionAllowed = (cluster: OcmClusterType) => {
  if (cluster.aiSupportLevels) {
    return getFeatureSupported(cluster.aiSupportLevels.features || [], 'SINGLE_NODE_EXPANSION');
  } else {
    return false;
  }
};

const makeState = (
  state: 'hidden' | 'visible' | 'disabled',
  tooltipMessage = '',
): AddHostsTabState => {
  switch (state) {
    case 'hidden':
      return {
        showTab: false,
        isDisabled: false,
        tabTooltip: '',
      };
    case 'visible':
      return {
        showTab: true,
        isDisabled: false,
        tabTooltip: tooltipMessage,
      };
    case 'disabled':
      return {
        showTab: true,
        isDisabled: true,
        tabTooltip: tooltipMessage,
      };
  }
};

export const getAddHostsTabState = (cluster: OcmClusterType): AddHostsTabState => {
  const isClusterStateReady = /ready|installed/.test(cluster.state);
  const wasInstalledUsingAssistedInstaller = cluster.product?.id === 'OCP-AssistedInstall';
  // Checking if the Day1 cluster has reported metrics, so it can be determined if it's an SNO / multi node and has required information
  const day1ClusterHostCount = cluster.metrics?.nodes?.total || 0;

  if (isClusterStateReady && wasInstalledUsingAssistedInstaller) {
    let tabState = makeState('visible');
    if (day1ClusterHostCount === 1 && !isSNOExpansionAllowed(cluster)) {
      // The cluster has metrics etc., but it's an SNO with an OpenshiftVersion that doesn't support Day2 flow
      tabState = makeState(
        'disabled',
        'OpenShift version not supported for SNO expansion. Hosts cannot be added to an existing SNO cluster that was installed with any OpenShift version older than 4.11. Upgrade to a newer OpenShift version and try again.',
      );
    }

    return tabState;
  } else {
    // The cluster is not ready or was not installed using Assisted Installer.
    // (see: https://issues.redhat.com/browse/HAC-3989)
    return makeState('hidden');
  }
};
