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
import { AgentK8sResource, BareMetalHostK8sResource, InfraEnvK8sResource } from '../../../types';
import AddHostDropdown from '../AddHostDropdown';
import { DOC_VERSION } from '../../../config/constants';
import { getAgentsHostsNames } from '../../ClusterDeployment';
import DetailsTab from './DetailsTab';
import AgentsTab from './AgentsTab';
import { getErrorMessage } from '../../../../common/utils';
import { Selector, useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { useInfraEnv } from '../../../hooks/useInfraEnvs';
import { useAgents } from '../../../hooks/useAgents';
import { useBMHs } from '../../../hooks/useBMHs';
import { INFRAENV_AGENTINSTALL_LABEL_KEY } from '../../common';

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
  const { name = '', ns = '' } = useParams<{ name: string; ns: string }>();
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

const useInfraEnvResources = (): [
  InfraEnvK8sResource,
  AgentK8sResource[],
  BareMetalHostK8sResource[],
  boolean,
  unknown,
] => {
  const { name, ns } = useParams() as { name: string; ns: string };
  const [infraEnv, infraLoaded, infraErr] = useInfraEnv({ name, namespace: ns });

  const selector: Selector = {};
  if (infraEnv?.status?.agentLabelSelector?.matchLabels) {
    selector.matchLabels = infraEnv.status.agentLabelSelector.matchLabels;
  }
  if (infraEnv?.status?.agentLabelSelector?.matchExpressions) {
    selector.matchExpressions = infraEnv.status.agentLabelSelector.matchExpressions;
  }

  const [infraAgents, agentsLoaded, agentsErr] = useAgents(
    infraEnv
      ? {
          namespace: infraEnv.metadata?.namespace,
          selector,
        }
      : null,
  );

  const [infraBMHs, bmhsLoaded, bmhsErr] = useBMHs(
    infraEnv
      ? {
          namespace: infraEnv.metadata?.namespace,
          selector: {
            matchLabels: {
              [INFRAENV_AGENTINSTALL_LABEL_KEY]: infraEnv?.metadata?.name || '',
            },
          },
        }
      : null,
  );

  return [
    infraEnv,
    infraAgents,
    infraBMHs,
    infraLoaded && agentsLoaded && bmhsLoaded,
    infraErr || agentsErr || bmhsErr,
  ];
};

const InfraEnvDetails = () => {
  const [infraEnv, infraAgents, infraBMHs, loaded, error] = useInfraEnvResources();

  if (!loaded) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState title={getErrorMessage(error)} />;
  }
  return (
    <InfraEnvDetailsContent infraAgents={infraAgents} infraBMHs={infraBMHs} infraEnv={infraEnv} />
  );
};

export default InfraEnvDetails;
