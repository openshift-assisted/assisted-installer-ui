import React from 'react';
import {
  ButtonVariant,
  Card,
  CardBody,
  CardFooter,
  CardTitle,
  Grid,
  Stack,
  StackItem,
  Title,
  Toolbar,
  ToolbarContent,
} from '@patternfly/react-core';
import { getApiErrorMessage, handleApiError } from '../../api';
import { DiscoveryImageModal } from '../clusterConfiguration/DiscoveryImageModal';
import { ModalDialogsContextProvider } from '../hosts/ModalDialogsContext';
import {
  ToolbarButton,
  getReadyHostCount,
  Alerts,
  AddHostsContext,
  alertsSlice,
  canInstallHost,
} from '../../../common';
import InventoryAddHosts from './InventoryAddHost';
import { onFetchEvents } from '../fetching/fetchEvents';
import { HostsService } from '../../services';
import ClusterDetailStatusVarieties, {
  useClusterStatusVarieties,
} from '../clusterDetail/ClusterDetailStatusVarieties';
import ViewClusterEventsButton from '../../../common/components/ui/ViewClusterEventsButton';

const { addAlert } = alertsSlice.actions;

export const AddHosts = () => {
  const { cluster, resetCluster } = React.useContext(AddHostsContext);
  const [isSubmitting, setSubmitting] = React.useState(false);
  const clusterVarieties = useClusterStatusVarieties(cluster);

  const handleHostsInstall = React.useCallback(async () => {
    setSubmitting(true);
    try {
      if (!cluster || !resetCluster || !cluster.hosts) {
        return;
      }

      const hostsToBeInstalled = cluster.hosts.filter((host) =>
        canInstallHost(cluster, host.status),
      );

      await HostsService.installAll(hostsToBeInstalled);
      await resetCluster();
    } catch (e) {
      handleApiError(e, () =>
        addAlert({
          title: 'Failed to start hosts installation.',
          message: getApiErrorMessage(e),
        }),
      );
    } finally {
      setTimeout(() => {
        setSubmitting(false);
      }, 10000);
    }
  }, [cluster, resetCluster]);

  if (!cluster || !resetCluster) {
    return null;
  }

  return (
    <ModalDialogsContextProvider>
      <Card>
        <CardTitle>
          <Title headingLevel="h2" size="lg" className="card-title">
            Host Discovery
          </Title>
        </CardTitle>
        <CardBody>
          <Stack hasGutter>
            <StackItem>
              <Grid hasGutter>
                <ClusterDetailStatusVarieties
                  cluster={cluster}
                  clusterVarieties={clusterVarieties}
                />
              </Grid>
            </StackItem>
            <StackItem>
              <InventoryAddHosts cluster={cluster} />
            </StackItem>
          </Stack>
        </CardBody>

        <CardFooter>
          <Alerts />
          <Toolbar id="cluster-toolbar">
            <ToolbarContent>
              <ToolbarButton
                variant={ButtonVariant.primary}
                name="install"
                onClick={() => void handleHostsInstall()}
                isDisabled={isSubmitting || getReadyHostCount(cluster) === 0}
              >
                Install ready hosts
              </ToolbarButton>
              <ViewClusterEventsButton cluster={cluster} onFetchEvents={onFetchEvents} />
            </ToolbarContent>
          </Toolbar>
        </CardFooter>
      </Card>
      <DiscoveryImageModal />
    </ModalDialogsContextProvider>
  );
};
