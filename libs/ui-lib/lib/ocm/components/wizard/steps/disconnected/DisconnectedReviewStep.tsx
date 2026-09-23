import * as React from 'react';
import { saveAs } from 'file-saver';
import { useNavigate } from 'react-router';
import {
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
  PULL_SECRET_INFO_LINK,
  singleClusterOperators,
  WithErrorBoundary,
  getOperatorSpecs,
  ExternalLink,
  getDisconnectedDocsLink,
  getMajorMinorVersion,
} from '../../../../../common';
import { ClusterWizardFooter, ClusterWizardNavigation } from '../../wizardComponents';
import { useClusterWizardContext } from '../../clusterWizardContext';
import { DISCONNECTED_OPENSHIFT_VERSION } from './BasicStep';

const opSpecs = getOperatorSpecs(() => undefined, true);

export const DisconnectedReviewStep = () => {
  const { moveBack, disconnectedInfraEnv } = useClusterWizardContext();
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
          <Content component="h2">Review and download ISO</Content>
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
            {disconnectedInfraEnv?.rendezvousIp && (
              <DescriptionListGroup>
                <DescriptionListTerm>Rendezvous IP</DescriptionListTerm>
                <DescriptionListDescription>
                  {disconnectedInfraEnv.rendezvousIp}
                </DescriptionListDescription>
              </DescriptionListGroup>
            )}
            {disconnectedInfraEnv?.proxy?.httpProxy && (
              <DescriptionListGroup>
                <DescriptionListTerm>HTTP proxy</DescriptionListTerm>
                <DescriptionListDescription>
                  {disconnectedInfraEnv.proxy.httpProxy}
                </DescriptionListDescription>
              </DescriptionListGroup>
            )}
            {disconnectedInfraEnv?.proxy?.httpsProxy && (
              <DescriptionListGroup>
                <DescriptionListTerm>HTTPS proxy</DescriptionListTerm>
                <DescriptionListDescription>
                  {disconnectedInfraEnv.proxy.httpsProxy}
                </DescriptionListDescription>
              </DescriptionListGroup>
            )}
            {disconnectedInfraEnv?.proxy?.noProxy && (
              <DescriptionListGroup>
                <DescriptionListTerm>No proxy</DescriptionListTerm>
                <DescriptionListDescription>
                  {disconnectedInfraEnv.proxy.noProxy}
                </DescriptionListDescription>
              </DescriptionListGroup>
            )}
            {disconnectedInfraEnv?.ntpSources && (
              <DescriptionListGroup>
                <DescriptionListTerm>NTP sources</DescriptionListTerm>
                <DescriptionListDescription>
                  {disconnectedInfraEnv.ntpSources}
                </DescriptionListDescription>
              </DescriptionListGroup>
            )}
            <DescriptionListGroup>
              <DescriptionListTerm>CPU architecture</DescriptionListTerm>
              <DescriptionListDescription>
                {disconnectedInfraEnv?.cpuArchitecture ?? 'x86_64'}
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>ISO size</DescriptionListTerm>
              <DescriptionListDescription>approx. 60+GB</DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </Grid>
      </WithErrorBoundary>
    </ClusterWizardStep>
  );
};
