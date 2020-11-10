import React from 'react';
import { PageSectionVariants, Breadcrumb, BreadcrumbItem } from '@patternfly/react-core';
import { Link } from 'react-router-dom';
import PageSection from '../ui/PageSection';
import { isSingleClusterMode, routeBasePath } from '../../config';
import DeveloperPreview from '../ui/DeveloperPreview';
import { ocmClient } from '../../api';

type Props = {
  clusterName?: string;
  isHidden?: boolean;
};

const ClusterBreadcrumbs: React.FC<Props> = ({ clusterName, isHidden = isSingleClusterMode() }) =>
  isHidden ? null : (
    <PageSection variant={PageSectionVariants.light}>
      {(clusterName || ocmClient) && (
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to={'/'}>Clusters</Link>
          </BreadcrumbItem>
          {clusterName ? (
            <BreadcrumbItem>
              <Link to={`${routeBasePath}/clusters`}>Assisted Bare Metal Clusters</Link>
            </BreadcrumbItem>
          ) : (
            <BreadcrumbItem isActive>Assisted Bare Metal Clusters</BreadcrumbItem>
          )}
          {clusterName && <BreadcrumbItem isActive>{clusterName}</BreadcrumbItem>}
        </Breadcrumb>
      )}
      <DeveloperPreview />
    </PageSection>
  );

export default ClusterBreadcrumbs;
