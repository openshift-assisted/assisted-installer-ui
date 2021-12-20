import {
  ButtonVariant,
  Card,
  CardBody,
  CardTitle,
  Title,
  Toolbar,
  ToolbarContent,
} from '@patternfly/react-core';
import React from 'react';
import { getErrorMessage, handleApiError } from '../../api';
import { DiscoveryImageModal } from '../clusterConfiguration/discoveryImageModal';
import { ModalDialogsContextProvider } from '../hosts/ModalDialogsContext';
import {
  ToolbarButton,
  ToolbarSecondaryGroup,
  getReadyHostCount,
  Alerts,
  AddHostsContext,
  alertsSlice,
  EventsModalButton,
} from '../../../common';
import InventoryAddHosts from './InventoryAddHost';
import { onFetchEvents } from '../fetching/fetchEvents';
import { HostsService } from '../../services';

const { addAlert } = alertsSlice.actions;

const AddHosts: React.FC = () => {
  const { cluster, resetCluster } = React.useContext(AddHostsContext);
  const [isSubmitting, setSubmitting] = React.useState(false);

  if (!cluster || !resetCluster) {
    return null;
  }

  const handleHostsInstall = async () => {
    setSubmitting(true);
    try {
      await HostsService.installAll(cluster);
      resetCluster();
    } catch (e) {
      handleApiError(e, () =>
        addAlert({
          title: 'Failed to start hosts installation.',
          message: getErrorMessage(e),
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
          <InventoryAddHosts />
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
              <ToolbarSecondaryGroup>
                <EventsModalButton
                  id="cluster-events-button"
                  entityKind="cluster"
                  cluster={cluster}
                  title="Cluster Events"
                  variant={ButtonVariant.link}
                  style={{ textAlign: 'right' }}
                  onFetchEvents={onFetchEvents}
                >
                  View Cluster Events
                </EventsModalButton>
              </ToolbarSecondaryGroup>
            </ToolbarContent>
          </Toolbar>
        </CardBody>
      </Card>
      <DiscoveryImageModal />
    </ModalDialogsContextProvider>
  );
};

export default AddHosts;
