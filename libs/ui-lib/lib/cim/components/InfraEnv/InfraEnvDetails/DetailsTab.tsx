import { Card, CardBody, PageSection } from '@patternfly/react-core';
import * as React from 'react';
import { EnvironmentErrors } from '../EnvironmentErrors';
import EnvironmentDetails from '../EnvironmentDetails';
import { DOC_VERSION } from '../../../config/constants';
import { AgentK8sResource, BareMetalHostK8sResource, InfraEnvK8sResource } from '../../../types';

const DetailsTab = ({
  infraEnv,
  infraAgents,
  infraBMHs,
}: {
  infraEnv: InfraEnvK8sResource;
  infraAgents: AgentK8sResource[];
  infraBMHs: BareMetalHostK8sResource[];
}) => {
  return (
    <PageSection>
      <EnvironmentErrors infraEnv={infraEnv} docVersion={DOC_VERSION} />
      <Card>
        <CardBody>
          <EnvironmentDetails
            infraEnv={infraEnv}
            hasAgents={!!infraAgents.length}
            hasBMHs={!!infraBMHs.length}
          />
        </CardBody>
      </Card>
    </PageSection>
  );
};

export default DetailsTab;
