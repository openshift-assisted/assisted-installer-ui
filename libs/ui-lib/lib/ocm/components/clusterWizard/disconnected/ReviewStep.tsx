import * as React from 'react';
import ClusterWizardFooter from '../ClusterWizardFooter';
import { useClusterWizardContext } from '../ClusterWizardContext';
import {
  ClusterWizardStep,
  TechnologyPreview,
  PULL_SECRET_INFO_LINK,
  singleClusterOperators,
} from '../../../../common';
import ClusterWizardNavigation from '../ClusterWizardNavigation';
import { WithErrorBoundary } from '../../../../common/components/ErrorHandling/WithErrorBoundary';
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
import { Formik } from 'formik';
import { useNavigate, useParams } from 'react-router-dom-v5-compat';

import { getOperatorSpecs } from '../../../../common/components/operators/operatorSpecs';

const ReviewStep = () => {
  const { moveBack, disconnectedInfraEnv } = useClusterWizardContext();
  const { clusterId } = useParams<{ clusterId: string }>();
  const opSpecs = getOperatorSpecs(() => undefined);
  const navigate = useNavigate();

  return (
    <Formik
      initialValues={{}}
      onSubmit={() => {
        // nothing to do
      }}
    >
      <ClusterWizardStep
        navigation={<ClusterWizardNavigation />}
        footer={
          <ClusterWizardFooter
            onNext={() => {
              if (disconnectedInfraEnv?.downloadUrl) {
                window.open(disconnectedInfraEnv.downloadUrl, '_blank');
              }
              navigate('/cluster-list');
            }}
            onBack={moveBack}
            nextButtonText="Download ISO"
            disconnectedClusterId={clusterId}
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
            <Alert isInline variant="info" title="Discovery ISO boot instructions">
              <List component={ListComponent.ol} type={OrderType.number}>
                <ListItem>Download ISO</ListItem>
                <ListItem>
                  Download or copy your pull secret from{' '}
                  <a href={PULL_SECRET_INFO_LINK} target="_blank" rel="noopener noreferrer">
                    here
                  </a>
                </ListItem>
                <ListItem>
                  Boot your cluster's machines from this ISO and follow instructions
                </ListItem>
                <ListItem>
                  Provide your pull secret inside the installation wizard when requested
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
              {disconnectedInfraEnv?.rendezvousIp && (
                <DescriptionListGroup>
                  <DescriptionListTerm>Controller Ip</DescriptionListTerm>
                  <DescriptionListDescription>
                    {disconnectedInfraEnv?.rendezvousIp}
                  </DescriptionListDescription>
                </DescriptionListGroup>
              )}
              <DescriptionListGroup>
                <DescriptionListTerm>OpenShift version</DescriptionListTerm>
                <DescriptionListDescription>
                  {disconnectedInfraEnv?.openshiftVersion || ''}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>CPU architecture</DescriptionListTerm>
                <DescriptionListDescription>x86_64</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>ISO size</DescriptionListTerm>
                <DescriptionListDescription>approx. 43.5GB</DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </Grid>
        </WithErrorBoundary>
      </ClusterWizardStep>
    </Formik>
  );
};

export default ReviewStep;
