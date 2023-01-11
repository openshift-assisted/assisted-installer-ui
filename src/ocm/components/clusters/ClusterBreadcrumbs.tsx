import React from 'react';
import {
  PageSectionVariants,
  Breadcrumb,
  BreadcrumbItem,
  PageSection,
} from '@patternfly/react-core';
import { Link } from 'react-router-dom';
import { routeBasePath } from '../../config';
import { ocmClient } from '../../api';

const ClusterBreadcrumbs = ({ clusterName }: { clusterName?: string }) => (
  <PageSection variant={PageSectionVariants.light}>
    {(clusterName || ocmClient) && (
      <Breadcrumb>
        <BreadcrumbItem>
          <Link to={'/'}>Clusters</Link>
        </BreadcrumbItem>
        {clusterName ? (
          <BreadcrumbItem>
            <Link to={`${routeBasePath}/clusters`}>Assisted Clusters</Link>
          </BreadcrumbItem>
        ) : (
          <BreadcrumbItem isActive>Assisted Clusters</BreadcrumbItem>
        )}
        {clusterName && <BreadcrumbItem isActive>{clusterName}</BreadcrumbItem>}
      </Breadcrumb>
    )}
  </PageSection>
);

export default ClusterBreadcrumbs;
