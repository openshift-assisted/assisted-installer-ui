import React from 'react';
import { GridItem, Button, ClipboardCopy, clipboardCopyFunc, StackItem } from "@patternfly/react-core";
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
          <StackItem>
                <TroubleshootingOpenshiftConsoleButton
                  consoleUrl={credentials.consoleUrl}
                  cluster={cluster}
                  idPrefix={idPrefix}
                />
          </StackItem>
        )}
        &nbsp;
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
