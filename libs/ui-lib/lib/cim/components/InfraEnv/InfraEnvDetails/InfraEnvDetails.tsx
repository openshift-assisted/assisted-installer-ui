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
import { getErrorMessage } from '../../../../common/utils';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';

const infraEnvironmentHosts = '/k8s/ns/:ns/agent-install.openshift.io~v1beta1~InfraEnv/:name/hosts';
const infraEnvironmentOverview = '/k8s/ns/:ns/agent-install.openshift.io~v1beta1~InfraEnv/:name';

const InfraEnvDetailsContent = ({
  infraEnv,
  infraAgents,
  infraBMHs,
}: {
  infraEnv: InfraEnvK8sResource;
  infraAgents: AgentK8sResource[];
  infraBMHs: BareMetalHostK8sResource[];
}) => {
  const [activeNs] = useActiveNamespace();
  const { name, ns } = useParams() as { name: string; ns: string };
  const location = useLocation();
  const { t } = useTranslation();
  const usedHostnames = React.useMemo(
    () => getAgentsHostsNames(infraAgents, infraBMHs),
    [infraAgents, infraBMHs],
  );
  const overviewPath = generatePath(infraEnvironmentOverview, { name, ns });
  const hostsPath = generatePath(infraEnvironmentHosts, { name, ns });

  return (
    <>
      <PageSection variant="light">
        <Stack hasGutter>
          <StackItem>
            <Breadcrumb ouiaId="InfraEnvBreadcrumb">
              <BreadcrumbItem>
                <Link
                  to={`/k8s/${
                    activeNs === '#ALL_NS#' ? 'all-namespaces' : `ns/${activeNs}`
                  }/agent-install.openshift.io~v1beta1~InfraEnv`}
                >
                  {t('ai:Host inventory')}
                </Link>
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
  const { name, ns } = useParams() as { name: string; ns: string };

  const [infraEnv, infraLoaded, infraErr] = useK8sWatchResource<InfraEnvK8sResource>({
    groupVersionKind: {
      kind: InfraEnvModel.kind,
      version: InfraEnvModel.apiVersion,
      group: InfraEnvModel.apiGroup,
    },
    name,
    namespace: ns,
    isList: false,
  });

  const [infraAgents, agentsLoaded, agentsErr] = useInfraEnvAgents(infraEnv);
  const [infraBMHs, bmhsLoaded, bmhsErr] = useInfraEnvBMHs(infraEnv);

  if (!infraLoaded || !agentsLoaded || !bmhsLoaded) {
    return <LoadingState />;
  }

  const error = infraErr || agentsErr || bmhsErr;

  if (error) {
    return <ErrorState title={getErrorMessage(error)} />;
  }
  return (
    <InfraEnvDetailsContent infraAgents={infraAgents} infraBMHs={infraBMHs} infraEnv={infraEnv} />
  );
};

export default InfraEnvDetails;
