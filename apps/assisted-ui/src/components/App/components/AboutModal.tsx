import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  AboutModal as PFAboutModal,
  TextContent,
  ButtonVariant,
} from '@patternfly/react-core';
import { GIT_SHA, VERSION, SERVICE_LABELS, IMAGE_REPO } from '../../../config.js';
import redHatLogo from '../../../images/Logo-Red_Hat-OpenShift_Container_Platform-B-Reverse-RGB.png';
import {
  Services,
  Api,
  Constants,
  DetailList,
  DetailItem,
  ListVersions,
} from '@openshift-assisted/ui-lib/ocm';

export const AboutModalButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => setIsModalOpen(false);
  const handleClick = () => setIsModalOpen(true);
  return (
    <>
      <Button variant={ButtonVariant.plain} onClick={handleClick} id="button-about">
        About
      </Button>
      <AboutModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
};

type AboutModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
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
      typeof IMAGE_REPO === 'string' ? (
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
      <TextContent>
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
      </TextContent>
    </PFAboutModal>
  );
};

export default AboutModalButton;
