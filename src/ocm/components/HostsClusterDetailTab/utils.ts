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

const visibleTabResult = {
  showTab: true,
  isDisabled: false,
  tabTooltip: '',
};

const hiddenTabResult = {
  showTab: false,
  isDisabled: false,
  tabTooltip: '',
};

const disabledTabResult = (tooltipMessage: string) => ({
  showTab: true,
  isDisabled: true,
  tabTooltip: tooltipMessage,
});

export const getAddHostTabDetails = ({ cluster }: { cluster: OcmClusterType }) => {
  // TODO MGMT-11768 Remove "cannot edit" and make the content read-only (assuming the other conditions are satisfied)
  const isHiddenTab =
    !cluster.canEdit || cluster.state !== 'ready' || cluster.product?.id !== 'OCP-AssistedInstall';
  if (isHiddenTab) {
    return hiddenTabResult;
  }

  // Checking if the Day1 cluster has reported metrics, so it can be determined if it's an SNO / multi node and has required information
  // If that's not the case, we will still show the tab, and the content will be an ErrorState with an explanation message
  const day1ClusterHostCount = cluster.metrics?.nodes?.total || 0;
  if (day1ClusterHostCount === 0 || !Day2ClusterService.getOpenshiftClusterId(cluster)) {
    return visibleTabResult;
  }

  // The cluster has metrics etc., but it's an SNO with an OpenshiftVersion that doesn't support Day2 flow
  if (day1ClusterHostCount === 1 && !isSNOExpansionAllowed(cluster)) {
    return disabledTabResult(
      'OpenShift version not supported for SNO expansion. Hosts cannot be added to an existing SNO cluster that was installed with any OpenShift version older than 4.11. Upgrade to a newer OpenShift version and try again.',
    );
  }

  // This is a cluster that supports the AI Day2 flow
  return visibleTabResult;
};
