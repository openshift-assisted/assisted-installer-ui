import {
  Breadcrumb,
  BreadcrumbItem,
  Nav,
  NavItem,
  NavList,
  PageSection,
  Split,
  SplitItem,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import * as React from 'react';
import { generatePath, Link, useLocation, useParams } from 'react-router-dom-v5-compat';
import { ErrorState, LoadingState, useTranslation } from '../../../../common';
import InfraEnvHostsTabAgentsWarning from '../InfraEnvHostsTabAgentsWarning';
import { useK8sWatchResource } from '../../../hooks/useK8sWatchResource';
import { InfraEnvModel } from '../../../types/models';
import { useInfraEnvAgents } from '../../../hooks/useInfraEnvAgents';
import { useInfraEnvBMHs } from '../../../hooks/useInfraEnvBMHs';
import { AgentK8sResource, BareMetalHostK8sResource, InfraEnvK8sResource } from '../../../types';
import AddHostDropdown from '../AddHostDropdown';
import { DOC_VERSION } from '../../../config/constants';
import { getAgentsHostsNames } from '../../ClusterDeployment';
import DetailsTab from './DetailsTab';
import AgentsTab from './AgentsTab';

const infraEnvironmentHosts =
  '/multicloud/infrastructure/environments/details/:namespace/:name/hosts';
const infraEnvironmentOverview = '/multicloud/infrastructure/environments/details/:namespace/:name';

const InfraEnvDetailsContent = ({
  infraEnv,
  infraAgents,
  infraBMHs,
}: {
  infraEnv: InfraEnvK8sResource;
  infraAgents: AgentK8sResource[];
  infraBMHs: BareMetalHostK8sResource[];
}) => {
  const { name, namespace } = useParams() as { name: string; namespace: string };
  const location = useLocation();
  const { t } = useTranslation();
  const usedHostnames = React.useMemo(
    () => getAgentsHostsNames(infraAgents, infraBMHs),
    [infraAgents, infraBMHs],
  );
  const overviewPath = generatePath(infraEnvironmentOverview, { name, namespace });
  const hostsPath = generatePath(infraEnvironmentHosts, { name, namespace });

  return (
    <>
      <PageSection variant="light">
        <Stack hasGutter>
          <StackItem>
            <Breadcrumb ouiaId="InfraEnvBreadcrumb">
              <BreadcrumbItem to="/multicloud/infrastructure/environments">
                <Link to="/multicloud/infrastructure/environments">{t('ai:Host inventory')}</Link>
              </BreadcrumbItem>
              <BreadcrumbItem isActive>{name}</BreadcrumbItem>
            </Breadcrumb>
          </StackItem>
          <StackItem>
            <Split hasGutter>
              <SplitItem isFilled>
                <Title headingLevel="h1">{infraEnv.metadata?.name || ''}</Title>
              </SplitItem>
              <SplitItem>
                <AddHostDropdown
                  infraEnv={infraEnv}
                  docVersion={DOC_VERSION}
                  usedHostnames={usedHostnames}
                />
              </SplitItem>
            </Split>
          </StackItem>
        </Stack>
      </PageSection>
      <PageSection variant="light" type="nav" style={{ paddingTop: 0, paddingBottom: 0 }}>
        <Nav variant="tertiary">
          <NavList>
            <NavItem isActive={location.pathname === overviewPath}>
              <Link to={overviewPath}>{t('ai:Details')}</Link>
            </NavItem>
            <NavItem isActive={location.pathname === hostsPath}>
              <Link to={hostsPath}>
                {
                  <>
                    <InfraEnvHostsTabAgentsWarning
                      infraAgents={infraAgents}
                      infraBMHs={infraBMHs}
                    />
                    {t('ai:Hosts')}
                  </>
                }
              </Link>
            </NavItem>
          </NavList>
        </Nav>
      </PageSection>
      {location.pathname === overviewPath && (
        <DetailsTab infraAgents={infraAgents} infraEnv={infraEnv} infraBMHs={infraBMHs} />
      )}
      {location.pathname === hostsPath && (
        <AgentsTab infraAgents={infraAgents} infraEnv={infraEnv} infraBMHs={infraBMHs} />
      )}
    </>
  );
};

const InfraEnvDetails = () => {
  const { name, namespace } = useParams() as { name: string; namespace: string };

  const [infraEnv, loaded, error] = useK8sWatchResource<InfraEnvK8sResource>({
    groupVersionKind: {
      kind: InfraEnvModel.kind,
      version: InfraEnvModel.apiVersion,
      group: InfraEnvModel.apiGroup,
    },
    name,
    namespace,
    isList: false,
  });

  const [infraAgents, agentsLoaded, agentsErr] = useInfraEnvAgents(infraEnv);
  const [infraBMHs, bmhsLoaded, bmhsErr] = useInfraEnvBMHs(infraEnv);

  if (!loaded || !agentsLoaded || !bmhsLoaded) {
    return <LoadingState />;
  }

  if (error || agentsErr || bmhsErr) {
    return <ErrorState />;
  }
  return (
    <InfraEnvDetailsContent infraAgents={infraAgents} infraBMHs={infraBMHs} infraEnv={infraEnv} />
  );
};

export default InfraEnvDetails;
