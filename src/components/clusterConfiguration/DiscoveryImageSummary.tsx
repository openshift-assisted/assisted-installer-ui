import React from 'react';
import { saveAs } from 'file-saver';
import {
  Button,
  ButtonVariant,
  ClipboardCopy,
  clipboardCopyFunc,
  EmptyState,
  EmptyStateIcon,
  EmptyStateVariant,
  Title,
  ModalBoxBody,
  ModalBoxFooter,
  TextContent,
  Spinner,
} from '@patternfly/react-core';
import { global_success_color_100 as successColor } from '@patternfly/react-tokens';
import { CheckCircleIcon } from '@patternfly/react-icons';
import { Cluster } from '../../api/types';
import { getClusterDownloadsImageUrl } from '../../api/clusters';
import { DetailList, DetailItem } from '../ui/DetailList';

type DiscoveryImageSummaryProps = {
  clusterId: Cluster['id'];
  imageInfo: Cluster['imageInfo'];
  onClose: () => void;
  onReset: () => void;
};

const DiscoveryImageSummary: React.FC<DiscoveryImageSummaryProps> = ({
  clusterId,
  imageInfo,
  onClose,
  onReset,
}) => {
  const [url, setURL] = React.useState<string>();
  React.useEffect(() => {
    getClusterDownloadsImageUrl(clusterId).then(setURL);
  }, [clusterId]);
  const { proxyUrl } = imageInfo;
  return url ? (
    <>
      <ModalBoxBody>
        <EmptyState variant={EmptyStateVariant.small}>
          <EmptyStateIcon icon={CheckCircleIcon} color={successColor.value} />
          <Title headingLevel="h4" size="lg">
            Discovery ISO is ready to download
          </Title>
        </EmptyState>
        <TextContent>
          <DetailList>
            <DetailItem
              title="Discovery ISO URL"
              value={
                <ClipboardCopy isReadOnly onCopy={(event) => clipboardCopyFunc(event, url)}>
                  {url}
                </ClipboardCopy>
              }
            />
            {proxyUrl && <DetailItem title="HTTP Proxy URL" value={proxyUrl} />}
          </DetailList>
        </TextContent>
      </ModalBoxBody>
      <ModalBoxFooter>
        <Button variant={ButtonVariant.primary} onClick={() => saveAs(url)}>
          Download Discovery ISO
        </Button>
        <Button variant={ButtonVariant.secondary} onClick={onClose}>
          Close
        </Button>
        <Button variant={ButtonVariant.link} onClick={onReset}>
          Edit ISO Configuration
        </Button>
      </ModalBoxFooter>
    </>
  ) : (
    <ModalBoxBody>
      <EmptyState variant={EmptyStateVariant.small}>
        <EmptyStateIcon icon={CheckCircleIcon} color={successColor.value} />
        <Spinner size="xl" />
      </EmptyState>
    </ModalBoxBody>
  );
};

export default DiscoveryImageSummary;
