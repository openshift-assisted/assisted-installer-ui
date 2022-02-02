import React from 'react';
import { GridItem, Button, ClipboardCopy, clipboardCopyFunc } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { Credentials, Cluster } from '../../api/types';
import { LoadingState, ErrorState } from '../../components/ui/uiState';
import { DetailList, DetailItem } from '../../components/ui/DetailList';
import { TroubleshootingOpenshiftConsoleButton } from './ConsoleModal';

type ClusterCredentialsProps = {
  cluster: Cluster;
  error?: boolean;
  retry?: () => void;
  credentials?: Credentials;
  idPrefix?: string;
};

const ClusterCredentials: React.FC<ClusterCredentialsProps> = ({
  cluster,
  credentials,
  error = false,
  retry,
  idPrefix = 'cluster-creds',
}) => {
  let credentialsBody: JSX.Element;
  if (error) {
    credentialsBody = <ErrorState title="Failed to fetch cluster credentials." fetchData={retry} />;
  } else if (!credentials) {
    credentialsBody = <LoadingState />;
  } else if (!credentials.username && !credentials.consoleUrl) {
    return <>N/A</>;
  } else {
    credentialsBody = (
      <DetailList>
        {credentials.consoleUrl && (
          <DetailItem
            title="Web Console URL"
            value={
              <>
                <Button
                  variant="link"
                  icon={<ExternalLinkAltIcon />}
                  iconPosition="right"
                  isInline
                  onClick={() => window.open(credentials.consoleUrl, '_blank', 'noopener')}
                  data-testid={`${idPrefix}-link-console-url`}
                >
                  {credentials.consoleUrl}
                </Button>
                <br />
                <TroubleshootingOpenshiftConsoleButton
                  consoleUrl={credentials.consoleUrl}
                  cluster={cluster}
                  idPrefix={idPrefix}
                />
              </>
            }
          />
        )}
        {credentials.username && (
          <>
            <DetailItem title="Username" value={credentials.username} />
            <DetailItem
              title="Password"
              value={
                <ClipboardCopy
                  isReadOnly
                  onCopy={(event) => clipboardCopyFunc(event, credentials.password)}
                >
                  &bull;&bull;&bull;&bull;&bull;
                </ClipboardCopy>
              }
            />
          </>
        )}
      </DetailList>
    );
  }

  return <GridItem span={12}>{credentialsBody}</GridItem>;
};

export default ClusterCredentials;
