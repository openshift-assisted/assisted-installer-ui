import React from 'react';
import { Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  PageSectionVariants,
  TextContent,
  Text,
  Progress,
  ButtonVariant,
} from '@patternfly/react-core';
import { Cluster } from '../../api/types';
import PageSection from '../ui/PageSection';
import HostsTable from '../clusterConfiguration/HostsTable';
import ClusterToolbar from '../clusters/ClusterToolbar';
import { ToolbarButton } from '../ui/Toolbar';
import { getHumanizedDateTime } from '../ui/utils';

type ClusterProgressProps = {
  cluster: Cluster;
};

const ClusterProgress: React.FC<ClusterProgressProps> = ({ cluster }) => {
  return (
    <>
      <PageSection variant={PageSectionVariants.light}>
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to="/clusters">Clusters</Link>
          </BreadcrumbItem>
          <BreadcrumbItem isActive>{cluster.name}</BreadcrumbItem>
        </Breadcrumb>
      </PageSection>
      <PageSection variant={PageSectionVariants.light} isMain>
        <TextContent>
          <Text component="h1">{cluster.name}</Text>
          <dl>
            <dt>Creation started at</dt>
            <dd>{getHumanizedDateTime(cluster.installStartedAt)}</dd>
            <dt>Creation progress</dt>
            <dd>
              <Progress
                label="Installing..."
                // measureLocation={ProgressMeasureLocation.inside}
                // value={50}
              />
            </dd>
          </dl>
          <Text component="h2">Bare metal inventory</Text>
        </TextContent>
        <HostsTable cluster={cluster} />
      </PageSection>
      <ClusterToolbar>
        <ToolbarButton type="submit" variant={ButtonVariant.danger}>
          Abort Installation
        </ToolbarButton>
        <ToolbarButton
          variant={ButtonVariant.link}
          component={(props) => <Link to="/clusters" {...props} />}
        >
          Close
        </ToolbarButton>
      </ClusterToolbar>
    </>
  );
};

export default ClusterProgress;
