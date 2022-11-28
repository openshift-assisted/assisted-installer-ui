import Day2ClusterService from '../../services/Day2ClusterService';
import { getFeatureSupported } from '../featureSupportLevels/FeatureSupportLevelProvider';
import { OcmClusterType } from '../AddHosts/types';

const isSNOExpansionAllowed = (cluster: OcmClusterType) => {
  return getFeatureSupported(
    cluster.openshift_version,
    cluster.aiSupportLevels || [],
    'SINGLE_NODE_EXPANSION',
  );
};

export const getAddHostTabDetails = ({ cluster }: { cluster: OcmClusterType }) => {
  const isAiDay2Ready = cluster.state === 'ready' && cluster.product?.id === 'OCP-AssistedInstall';

  // TODO camador make the tab visible for !canEdit with read-only content for Day2 in MGMT-11768
  const isHiddenTab = !cluster.canEdit || !isAiDay2Ready;
  if (isHiddenTab) {
    return {
      showTab: false,
      isDisabled: false,
      tabTooltip: '',
    };
  }

  // If it's a Day2 AI cluster, it can happen that the cluster hasn't reported required information yet.
  // In that case the Tab will be disabled and the content would be a message explaining what the problem is
  const day2ClusterHostCount = cluster.metrics?.nodes?.total || 0;
  if (day2ClusterHostCount === 0 || !Day2ClusterService.getOpenshiftClusterId(cluster)) {
    return {
      showTab: true,
      isDisabled: true,
      tabTooltip:
        day2ClusterHostCount === 0
          ? // TODO use real copy messages
            'The cluster did not report metrics yet'
          : 'Explanation of why the cluster cannot be scaled at this moment',
    };
  }

  if (day2ClusterHostCount === 1 && !isSNOExpansionAllowed(cluster)) {
    // It's an SNO with an OpenshiftVersion that doesn't support Day2 flow
    return {
      showTab: true,
      isDisabled: true,
      // TODO use real copy messages
      tabTooltip: 'The OpenShift version does not support adding hosts',
    };
  }

  // This is a multi-node cluster that supports the AI Day2 flow
  return {
    showTab: true,
    isDisabled: false,
    tabTooltip: '',
  };
};
