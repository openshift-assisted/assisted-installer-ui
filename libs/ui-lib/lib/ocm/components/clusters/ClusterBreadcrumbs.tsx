import React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  PageSection,
} from '@patternfly/react-core';
import { Link } from 'react-router-dom-v5-compat';
import { isInOcm } from '../../../common/api';

const ClusterBreadcrumbs = ({ clusterName }: { clusterName?: string }) => (
  <PageSection hasBodyWrapper={false} >
    {(clusterName || isInOcm) && (
      <Breadcrumb>
        {isInOcm && (
          <BreadcrumbItem
            data-testid="cluster-list-breadcrumb"
            render={() => <Link to={'/cluster-list'}>Cluster List</Link>}
          />
        )}

        {clusterName ? (
          <BreadcrumbItem data-testid="assisted-clusters-breadcrumb">
            <Link to={`..`}>Assisted Clusters</Link>
          </BreadcrumbItem>
        ) : (
          <BreadcrumbItem isActive data-testid="assisted-clusters-breadcrumb">
            Assisted Clusters
          </BreadcrumbItem>
        )}
        {clusterName && (
          <BreadcrumbItem data-testid="cluster-breadcrumb" isActive>
            {clusterName}
          </BreadcrumbItem>
        )}
      </Breadcrumb>
    )}
  </PageSection>
);

export default ClusterBreadcrumbs;
