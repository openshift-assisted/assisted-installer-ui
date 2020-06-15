import React from 'react';
import { Link } from 'react-router-dom';
import {
  PageSectionVariants,
  TextContent,
  Text,
  ButtonVariant,
  GridItem,
  Grid,
} from '@patternfly/react-core';
import { Cluster, Credentials } from '../../api/types';
import { getClusterCredentials } from '../../api/clusters';
import PageSection from '../ui/PageSection';
import { EventsModalButton } from '../ui/eventsModal';
import HostsTable from '../hosts/HostsTable';
import ClusterToolbar from '../clusters/ClusterToolbar';
import { ToolbarButton, ToolbarSecondaryGroup } from '../ui/Toolbar';
import ClusterBreadcrumbs from '../clusters/ClusterBreadcrumbs';
import ClusterProgress from './ClusterProgress';
import ClusterCredentials from './ClusterCredentials';
import ClusterInstallationError from './ClusterInstallationError';
import { LaunchOpenshiftConsoleButton } from './ConsoleModal';
import KubeconfigDownload from './KubeconfigDownload';
import { getHumanizedDateTime } from '../ui/utils';
import { DASH } from '../constants';
import { DetailList, DetailItem } from '../ui/DetailList';
import FeedbackAlert from './FeedbackAlert';

type ClusterDetailProps = {
  cluster: Cluster;
};

const ClusterProperties: React.FC<ClusterDetailProps> = ({ cluster }) => (
  <>
    <GridItem>
      <TextContent>
        <Text component="h2">Cluster Details</Text>
      </TextContent>
    </GridItem>
    <GridItem md={6} lg={4} xl={3}>
      <DetailList>
        <DetailItem title="OpenShift version" value={cluster.openshiftVersion} />
        <DetailItem
          title="Installation started At"
          value={getHumanizedDateTime(cluster.installStartedAt)}
        />
        <DetailItem
          title="Installation finished At"
          value={
            cluster.status === 'installed' ? getHumanizedDateTime(cluster.installCompletedAt) : DASH
          }
        />
      </DetailList>
    </GridItem>
    <GridItem md={6} lg={4} xl={3}>
      <DetailList>
        <DetailItem title="Base DNS domain" value={cluster.baseDnsDomain} />
        <DetailItem title="API virtual IP" value={cluster.apiVip} />
        <DetailItem title="Ingress virtual IP" value={cluster.ingressVip} />
      </DetailList>
    </GridItem>
    <GridItem md={6} lg={4} xl={3}>
      <DetailList>
        <DetailItem title="Cluster network CIDR" value={cluster.clusterNetworkCidr} />
        <DetailItem title="Cluster network host prefix" value={cluster.clusterNetworkHostPrefix} />
        <DetailItem title="Service network CIDR" value={cluster.serviceNetworkCidr} />
      </DetailList>
    </GridItem>
  </>
);

const ClusterDetail: React.FC<ClusterDetailProps> = ({ cluster }) => {
  const [credentials, setCredentials] = React.useState<Credentials>();
  const [credentialsError, setCredentialsError] = React.useState();

  const fetchCredentials = React.useCallback(() => {
    const fetch = async () => {
      setCredentialsError(undefined);
      try {
        const response = await getClusterCredentials(cluster.id);
        setCredentials(response.data);
      } catch (err) {
        setCredentialsError(err);
      }
    };
    fetch();
  }, [cluster.id]);

  React.useEffect(() => {
    if (cluster.status === 'installed') {
      fetchCredentials();
    }
  }, [cluster.status, fetchCredentials]);

  return (
    <>
      <ClusterBreadcrumbs clusterName={cluster.name} />
      <PageSection variant={PageSectionVariants.light} isMain>
        <Grid hasGutter>
          <GridItem>
            <TextContent>
              <Text component="h1">{cluster.name}</Text>
            </TextContent>
          </GridItem>
          <GridItem>
            <DetailList title="Creation Progress">
              <DetailItem title="Creation status" value={<ClusterProgress cluster={cluster} />} />
            </DetailList>
          </GridItem>
          {cluster.status === 'error' && (
            <ClusterInstallationError statusInfo={cluster.statusInfo} />
          )}
          {cluster.status === 'installed' && (
            <ClusterCredentials
              cluster={cluster}
              credentials={credentials}
              error={!!credentialsError}
              retry={fetchCredentials}
            />
          )}
          <KubeconfigDownload status={cluster.status} clusterId={cluster.id} />
          <FeedbackAlert />
          <GridItem>
            <TextContent>
              <Text component="h2">Bare Metal Inventory</Text>
            </TextContent>
            <HostsTable cluster={cluster} />
          </GridItem>
          <ClusterProperties cluster={cluster} />
        </Grid>
      </PageSection>
      <ClusterToolbar>
        {
          // TODO(jtomasek): enable this when available
          /* {cluster.status === 'installing' && (
          <ToolbarButton type="button" variant={ButtonVariant.danger} isDisabled>
            Abort Installation
          </ToolbarButton>
        )} */
        }
        {cluster.status === 'installed' && (
          <LaunchOpenshiftConsoleButton
            isDisabled={!credentials || !!credentialsError}
            cluster={cluster}
            consoleUrl={credentials?.consoleUrl}
          />
        )}
        <ToolbarButton
          variant={ButtonVariant.link}
          component={(props) => <Link to="/clusters" {...props} />}
        >
          Close
        </ToolbarButton>
        <ToolbarSecondaryGroup>
          <EventsModalButton
            entityKind="cluster"
            entityId={cluster.id}
            title="Cluster Events"
            variant={ButtonVariant.link}
            style={{ textAlign: 'right' }}
          >
            View Cluster Events History
          </EventsModalButton>
        </ToolbarSecondaryGroup>
      </ClusterToolbar>
    </>
  );
};

export default ClusterDetail;
