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
import React from 'react';
import { getApiErrorMessage, handleApiError } from '../../api/utils';
import { DiscoveryImageModal } from '../clusterConfiguration/discoveryImageModal';
import { ModalDialogsContextProvider } from '../hosts/ModalDialogsContext';
import {
  ToolbarButton,
  getReadyHostCount,
  Alerts,
  AddHostsContext,
  alertsSlice,
} from '../../../common';
import InventoryAddHosts from './InventoryAddHost';
import { onFetchEvents } from '../fetching/fetchEvents';
import { HostsService } from '../../services';
import ClusterDetailStatusVarieties, {
  useClusterStatusVarieties,
} from '../clusterDetail/ClusterDetailStatusVarieties';
import ViewClusterEventsButton from '../../../common/components/ui/ViewClusterEventsButton';

const { addAlert } = alertsSlice.actions;

const AddHosts: React.FC = () => {
  const { cluster, resetCluster } = React.useContext(AddHostsContext);
  const [isSubmitting, setSubmitting] = React.useState(false);
  const clusterVarieties = useClusterStatusVarieties(cluster);

  if (!cluster || !resetCluster) {
    return null;
  }

  const handleHostsInstall = async () => {
    setSubmitting(true);
    try {
      await HostsService.installAll(cluster);
      void resetCluster();
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
  };

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
              <InventoryAddHosts />
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
                onClick={handleHostsInstall}
                isDisabled={isSubmitting || getReadyHostCount(cluster) <= 0}
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

export default AddHosts;
