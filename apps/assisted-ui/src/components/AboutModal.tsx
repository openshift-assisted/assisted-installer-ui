import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { AboutModal as PFAboutModal, Content } from '@patternfly/react-core';
import { GIT_SHA, VERSION, SERVICE_LABELS, IMAGE_REPO } from '../config';
import redHatLogo from '/logo.svg';
import { Services, Api, Constants, DetailList, DetailItem } from '@openshift-assisted/ui-lib/ocm';
import { ListVersions } from '@openshift-assisted/types/assisted-installer-service';

type AboutModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const [{ versions, releaseTag }, setVersions] = useState<ListVersions>({
    versions: {},
    releaseTag: undefined,
  });

  const fetchData = useCallback(async () => {
    try {
      const { data } = await Services.APIs.ComponentVersionsAPI.list();
      setVersions(data);
    } catch (e) {
      Api.handleApiError(e);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      void fetchData();
    }
  }, [fetchData, isOpen]);

  const getUIVersion = () => {
    const link =
      typeof IMAGE_REPO !== 'undefined' ? (
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={GIT_SHA ? `https://${IMAGE_REPO}:${GIT_SHA}` : `https://${IMAGE_REPO}`}
        >
          {GIT_SHA ? `${IMAGE_REPO}:${GIT_SHA}` : `${IMAGE_REPO}`}
        </a>
      ) : null;

    // Display UI tag (VERSION) only if releaseTag is not populated
    if (releaseTag) {
      return link;
    }

    return (
      <>
        {VERSION} ({link})
      </>
    );
  };

  return (
    <PFAboutModal
      isOpen={isOpen}
      onClose={onClose}
      productName="OpenShift Container Platform Assisted Installer"
      brandImageSrc={redHatLogo}
      brandImageAlt="Assisted Installer Logo"
    >
      <Content>
        <DetailList>
          <>
            {releaseTag && <DetailItem title="Release tag" value={releaseTag} />}
            <DetailItem
              title="Assisted Installer UI version"
              value={getUIVersion()}
              idPrefix="ui-lib-version"
            />
            <DetailItem
              title="Assisted Installer UI library version"
              value={Constants.getAssistedUiLibVersion()}
            />
            {Object.keys(versions || {}).map((key) => {
              const version = versions ? versions[key] : '';
              return (
                <DetailItem
                  key={key}
                  title={SERVICE_LABELS[key] || key}
                  value={
                    <a target="_blank" rel="noopener noreferrer" href={`https://${version}`}>
                      {version}
                    </a>
                  }
                />
              );
            })}
          </>
        </DetailList>
      </Content>
    </PFAboutModal>
  );
};
