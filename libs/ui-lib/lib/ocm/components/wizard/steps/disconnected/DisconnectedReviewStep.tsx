import * as React from 'react';
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
  ClipboardCopy,
  clipboardCopyFunc,
  AlertVariant,
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
  DetailList,
  DetailItem,
} from '../../../../../common';
import { ClusterWizardFooter, ClusterWizardNavigation } from '../../wizardComponents';
import { useClusterWizardContext } from '../../clusterWizardContext';

const opSpecs = getOperatorSpecs(() => undefined, true);

export const DisconnectedReviewStep = () => {
  const { moveBack, disconnectedInfraEnv } = useClusterWizardContext();
  const openshiftVersion = disconnectedInfraEnv?.openshiftVersion;

  const wgetCommand = `wget -O agent-ove.x86_64.iso '${disconnectedInfraEnv?.downloadUrl || ''}'`;

  return (
    <ClusterWizardStep
      navigation={<ClusterWizardNavigation />}
      footer={
        <ClusterWizardFooter
          onBack={moveBack}
          nextButtonText="Download ISO"
          nextButtonProps={{
            isAriaDisabled: !disconnectedInfraEnv?.downloadUrl,
            isDisabled: !disconnectedInfraEnv?.downloadUrl,
            component: 'a',
            target: '_blank',
            href: disconnectedInfraEnv?.downloadUrl ?? '',
            download: true,
            rel: 'noopener noreferrer',
          }}
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
                  href={getDisconnectedDocsLink(getMajorMinorVersion(openshiftVersion))}
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
              <DescriptionListDescription>{openshiftVersion}</DescriptionListDescription>
            </DescriptionListGroup>
            {disconnectedInfraEnv?.rendezvousIp && (
              <DescriptionListGroup>
                <DescriptionListTerm>Rendezvous IP</DescriptionListTerm>
                <DescriptionListDescription>
                  {disconnectedInfraEnv.rendezvousIp}
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

          {disconnectedInfraEnv?.downloadUrl ? (
            <DetailList>
              <DetailItem
                title={'ISO URL'}
                value={
                  <ClipboardCopy
                    isReadOnly
                    onCopy={(event) => clipboardCopyFunc(event, disconnectedInfraEnv?.downloadUrl)}
                  >
                    {disconnectedInfraEnv?.downloadUrl || ''}
                  </ClipboardCopy>
                }
              />
              <DetailItem
                title={'Command to download the ISO:'}
                value={
                  <ClipboardCopy
                    isReadOnly
                    onCopy={(event) => clipboardCopyFunc(event, wgetCommand)}
                  >
                    {wgetCommand}
                  </ClipboardCopy>
                }
              />
            </DetailList>
          ) : (
            <Alert
              variant={AlertVariant.danger}
              title={'Something went wrong while retrieving the ISO URL'}
            />
          )}
        </Grid>
      </WithErrorBoundary>
    </ClusterWizardStep>
  );
};
