import React from 'react';
import { PageSectionVariants, Breadcrumb, BreadcrumbItem } from '@patternfly/react-core';
import { Link } from 'react-router-dom';
import PageSection from '../ui/PageSection';
import { isSingleClusterMode, routeBasePath } from '../../config';
import DeveloperPreview from '../ui/DeveloperPreview';

type Props = {
  clusterName?: string;
  isHidden?: boolean;
};

const ClusterBreadcrumbs: React.FC<Props> = ({ clusterName, isHidden = isSingleClusterMode() }) =>
  isHidden ? null : (
    <PageSection variant={PageSectionVariants.light}>
      <Breadcrumb>
        <BreadcrumbItem>
          <Link to={`${routeBasePath}/clusters`}>Clusters</Link>
        </BreadcrumbItem>
        <BreadcrumbItem isActive>{clusterName}</BreadcrumbItem>
      </Breadcrumb>
      <DeveloperPreview />
    </PageSection>
  );

export default ClusterBreadcrumbs;
