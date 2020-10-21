import { ButtonVariant, PageSectionVariants } from '@patternfly/react-core';
import React from 'react';
import { useDispatch } from 'react-redux';
import { Cluster, getErrorMessage, handleApiError, installHosts } from '../../api';
import { addAlert } from '../../features/alerts/alertsSlice';
import { updateCluster } from '../../features/clusters/currentClusterSlice';
import ClusterToolbar from '../clusters/ClusterToolbar';
import ClusterBreadcrumbs from '../clusters/ClusterBreadcrumbs';
import { isKnownHost } from '../hosts/utils';
import { PageSection, ToolbarButton } from '../ui';
import AlertsSection from '../ui/AlertsSection';
import BaremetalInventoryAddHosts from './BareMetalInventoryAddHost';

const AddBareMetalHosts: React.FC<{ cluster: Cluster }> = ({ cluster }) => {
  const dispatch = useDispatch();

  const handleHostsInstall = async () => {
    try {
      const { data } = await installHosts(cluster.id);
      dispatch(updateCluster(data));
    } catch (e) {
      handleApiError(e, () =>
        addAlert({
          title: 'Failed to start hosts installation.',
          message: getErrorMessage(e),
        }),
      );
    }
  };

  return (
    <>
      <ClusterBreadcrumbs clusterName={cluster.name} />
      <PageSection variant={PageSectionVariants.light} isMain>
        <BaremetalInventoryAddHosts cluster={cluster} />
      </PageSection>
      <AlertsSection />
      <ClusterToolbar>
        <ToolbarButton
          variant={ButtonVariant.primary}
          name="install"
          onClick={handleHostsInstall}
          isDisabled={!isKnownHost(cluster)}
        >
          Install ready hosts
        </ToolbarButton>
      </ClusterToolbar>
    </>
  );
};

export default AddBareMetalHosts;
