import { ButtonVariant, Card, CardBody, CardTitle, Title, Toolbar } from '@patternfly/react-core';
import React from 'react';
import { useDispatch } from 'react-redux';
import { Cluster, getErrorMessage, handleApiError, installHosts } from '../../api';
import { addAlert } from '../../features/alerts/alertsSlice';
import { updateCluster } from '../../features/clusters/currentClusterSlice';
import { isKnownHost } from '../hosts/utils';
import { ToolbarButton } from '../ui';
import { AlertsSectionGroup } from '../ui/AlertsSection';
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
    <Card>
      <CardTitle>
        <Title headingLevel="h2" size="lg" className="card-title">
          Bare Metal Discovery
        </Title>
      </CardTitle>
      <CardBody>
        <BaremetalInventoryAddHosts cluster={cluster} />
        <AlertsSectionGroup />
        <Toolbar id="cluster-toolbar">
          <ToolbarButton
            variant={ButtonVariant.primary}
            name="install"
            onClick={handleHostsInstall}
            isDisabled={!isKnownHost(cluster)}
          >
            Install ready hosts
          </ToolbarButton>
        </Toolbar>
      </CardBody>
    </Card>
  );
};

export default AddBareMetalHosts;
