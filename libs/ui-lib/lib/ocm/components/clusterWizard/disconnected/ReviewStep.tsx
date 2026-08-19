import * as React from 'react';
import { saveAs } from 'file-saver';
import { useNavigate } from 'react-router';
import {
  Split,
  SplitItem,
  Alert,
  Grid,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  List,
  ListItem,
  ListComponent,
  OrderType,
  Content,
} from '@patternfly/react-core';
import {
  ClusterWizardStep,
  TechnologyPreview,
  ExternalLink,
  getDisconnectedDocsLink,
  getMajorMinorVersion,
  PULL_SECRET_INFO_LINK,
  singleClusterOperators,
} from '../../../../common';
import { WithErrorBoundary } from '../../../../common/components/ErrorHandling/WithErrorBoundary';
import { getOperatorSpecs } from '../../../../common/components/operators/operatorSpecs';
import { useClusterWizardContext } from '../ClusterWizardContext';
import { DISCONNECTED_OPENSHIFT_VERSION } from './BasicStep';
import ClusterWizardFooter from '../ClusterWizardFooter';
import ClusterWizardNavigation from '../ClusterWizardNavigation';

const ReviewStep = () => {
  const { moveBack, disconnectedInfraEnv } = useClusterWizardContext();
  const opSpecs = getOperatorSpecs(() => undefined);
  const navigate = useNavigate();

  return (
    <ClusterWizardStep
      navigation={<ClusterWizardNavigation />}
      footer={
        <ClusterWizardFooter
          onNext={() => {
            saveAs(disconnectedInfraEnv?.downloadUrl ?? '');
            void navigate('/cluster-list');
          }}
          onBack={moveBack}
          nextButtonText="Download ISO"
        />
      }
    >
      <WithErrorBoundary title="Failed to load Review step">
        <Grid hasGutter>
          <Split>
            <SplitItem>
              <Content component="h2">Review and download ISO</Content>
            </SplitItem>
            <SplitItem>
              <TechnologyPreview />
            </SplitItem>
          </Split>
          <Alert isInline variant="info" title="ISO boot instructions">
            <List component={ListComponent.ol} type={OrderType.number}>
              <ListItem>Download the ISO.</ListItem>
              <ListItem>
                Boot your cluster's machines from this ISO and{' '}
                <ExternalLink
                  href={getDisconnectedDocsLink(
                    getMajorMinorVersion(DISCONNECTED_OPENSHIFT_VERSION),
                  )}
                >
                  follow instructions
                </ExternalLink>
                .
              </ListItem>
              <ListItem>
                Your <ExternalLink href={PULL_SECRET_INFO_LINK}>pull secret</ExternalLink> was
                included automatically. You can change it inside the installation wizard.
              </ListItem>
            </List>
          </Alert>
          <Alert isInline isExpandable variant="info" title="List of available operators">
            <List>
              {singleClusterOperators.map((o) => {
                const operator = Object.values(opSpecs)
                  .flatMap((op) => op)
                  .find((op) => op.operatorKey === o);
                return <ListItem key={o}>{operator ? operator.title : o}</ListItem>;
              })}
            </List>
          </Alert>
          <DescriptionList isHorizontal>
            <DescriptionListGroup>
              <DescriptionListTerm>OpenShift version</DescriptionListTerm>
              <DescriptionListDescription>
                {disconnectedInfraEnv?.openshiftVersion ?? DISCONNECTED_OPENSHIFT_VERSION}
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>CPU architecture</DescriptionListTerm>
              <DescriptionListDescription>
                {disconnectedInfraEnv?.cpuArchitecture ?? 'x86_64'}
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>ISO size</DescriptionListTerm>
              <DescriptionListDescription>approx. 50+GB</DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </Grid>
      </WithErrorBoundary>
    </ClusterWizardStep>
  );
};

export default ReviewStep;
