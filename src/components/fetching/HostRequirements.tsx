import React from 'react';
import { Button, ButtonVariant, Modal, ModalVariant, TextContent } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';
import {
  HostRequirementsRole,
  HostRequirements as HostRequirementsType,
  handleApiError,
  getErrorMessage,
} from '../../api';
import { getHostRequirements } from '../../api/hostRequirements';
import { addAlert } from '../../features/alerts/alertsSlice';
import { LoadingState } from '../ui';

import './HostRequirements.css';

export type HostRequirementsLinkProps = {
  ContentComponent: React.FC<{ worker?: HostRequirementsRole; master?: HostRequirementsRole }>;
};

type HostRequirementsModalProps = HostRequirementsLinkProps & {
  isOpen: boolean;
  setHostRequirementsOpen: (isOpen: boolean) => void;
};

const HostRequirementsModal: React.FC<HostRequirementsModalProps> = ({
  setHostRequirementsOpen,
  isOpen,
  ContentComponent,
}) => {
  const [hostRequirements, setHostRequirements] = React.useState<HostRequirementsType>();
  const onClose = React.useCallback(() => setHostRequirementsOpen(false), [
    setHostRequirementsOpen,
  ]);

  React.useEffect(() => {
    const fetchFunc = async () => {
      try {
        const { data } = await getHostRequirements();
        setHostRequirements(data);
      } catch (e) {
        handleApiError(e, () =>
          addAlert({
            title: 'Failed to retrieve minimum host requierements',
            message: getErrorMessage(e),
          }),
        );
      }
    };
    fetchFunc();
  }, [setHostRequirements]);

  return (
    <Modal
      title="Minimum hardware requirements"
      isOpen={isOpen}
      actions={[
        <Button key="close" variant={ButtonVariant.primary} onClick={onClose}>
          Close
        </Button>,
      ]}
      onClose={onClose}
      variant={ModalVariant.medium}
    >
      {hostRequirements ? (
        <TextContent>
          <ContentComponent {...hostRequirements} />
        </TextContent>
      ) : (
        <LoadingState content="Loading hardware requirements ..." />
      )}
    </Modal>
  );
};

export const HostRequirementsLink: React.FC<HostRequirementsLinkProps> = ({ ContentComponent }) => {
  const [isHostRequirementsOpen, setHostRequirementsOpen] = React.useState(false);

  return (
    <>
      <Button
        variant={ButtonVariant.link}
        onClick={() => setHostRequirementsOpen(true)}
        isInline
        className="host-requirements-link"
      >
        <InfoCircleIcon size="sm" />
        &nbsp;Minimum hardware requirements
      </Button>
      <HostRequirementsModal
        ContentComponent={ContentComponent}
        isOpen={isHostRequirementsOpen}
        setHostRequirementsOpen={setHostRequirementsOpen}
      />
    </>
  );
};
