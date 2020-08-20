import React from 'react';
import { Link } from 'react-router-dom';
import { Text, TextContent, TextVariants, Button, ButtonVariant } from '@patternfly/react-core';
import { WarningTriangleIcon } from '@patternfly/react-icons';
import { global_warning_color_100 as warningColor } from '@patternfly/react-tokens';
import HostsTable from '../hosts/HostsTable';
import { Cluster, HostRequirements } from '../../api/types';
import { DiscoveryImageModalButton } from './discoveryImageModal';
import {
  HostsNotShowingLink,
  DiscoveryTroubleshootingModal,
} from './DiscoveryTroubleshootingModal';
import { getHostRequirements } from '../../api/hostRequirements';
import { getErrorMessage, handleApiError } from '../../api';
import { addAlert } from '../../features/alerts/alertsSlice';
import ClusterWizardStep from '../clusterWizard/ClusterWizardStep';
import { EventsModalButton } from '../ui/eventsModal';
import ToolbarSecondaryGroup from '../ui/Toolbar/ToolbarSecondaryGroup';
import ClusterToolbar from '../clusters/ClusterToolbar';
import ToolbarText from '../ui/Toolbar/ToolbarText';
import ToolbarButton from '../ui/Toolbar/ToolbarButton';
import AlertsSection from '../ui/AlertsSection';
import { routeBasePath } from '../../config/constants';
import ClusterWizardContext from '../clusterWizard/ClusterWizardContext';
import ClusterValidationSection from './ClusterValidationSection';

interface BareMetalInventoryProps {
  cluster: Cluster;
}

const BaremetalInventory: React.FC<BareMetalInventoryProps> = ({ cluster }) => {
  const [isDiscoveryHintModalOpen, setDiscoveryHintModalOpen] = React.useState(false);
  const [hostRequirements, setHostRequirements] = React.useState<HostRequirements | null>(null);
  const { setCurrentStepId } = React.useContext(ClusterWizardContext);
  const [isValidationSectionOpen, setIsValidationSectionOpen] = React.useState(false);

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

  const content = (
    <>
      <TextContent>
        <Text component="h2">Bare Metal Inventory</Text>
        <Text component="p">
          <DiscoveryImageModalButton ButtonComponent={Button} cluster={cluster} />
        </Text>
        <Text component="p">
          Boot the Discovery ISO on hardware that should become part of this bare metal cluster.
          Hosts connected to the internet will be inspected and automatically appear below.{' '}
          <HostsNotShowingLink setDiscoveryHintModalOpen={setDiscoveryHintModalOpen} />
        </Text>
        {hostRequirements && (
          <Text component="p">
            Three master hosts are required with at least {hostRequirements.master?.cpuCores || 4}{' '}
            CPU cores, {hostRequirements.master?.ramGib || 16} GB of RAM, and{' '}
            {hostRequirements.master?.diskSizeGb || 120} GB of filesystem storage each. Two or more
            additional worker hosts are recommended with at least{' '}
            {hostRequirements.worker?.cpuCores || 2} CPU cores,{' '}
            {hostRequirements.worker?.ramGib || 8} GB of RAM, and{' '}
            {hostRequirements.worker?.diskSizeGb || 120}
            GB of filesystem storage each.
          </Text>
        )}
      </TextContent>
      <HostsTable cluster={cluster} setDiscoveryHintModalOpen={setDiscoveryHintModalOpen} />
      <DiscoveryTroubleshootingModal
        isOpen={isDiscoveryHintModalOpen}
        setDiscoveryHintModalOpen={setDiscoveryHintModalOpen}
      />
    </>
  );

  const footer = (
    <>
      <AlertsSection />
      <ClusterToolbar
        validationSection={
          isValidationSectionOpen ? (
            <ClusterValidationSection
              cluster={cluster}
              onClose={() => setIsValidationSectionOpen(false)}
            />
          ) : null
        }
      >
        <ToolbarButton
          variant={ButtonVariant.primary}
          name="next"
          onClick={() => setCurrentStepId('networking')}
          isDisabled={false}
        >
          Next
        </ToolbarButton>
        <ToolbarButton
          variant={ButtonVariant.link}
          component={(props) => <Link to={`${routeBasePath}/clusters`} {...props} />}
        >
          Close
        </ToolbarButton>
        <ToolbarText component={TextVariants.small}>
          <Button
            variant={ButtonVariant.link}
            onClick={() => setIsValidationSectionOpen(!isValidationSectionOpen)}
            isInline
          >
            <WarningTriangleIcon color={warningColor.value} /> Baremetal inventory is not sufficient
            for installation
          </Button>
        </ToolbarText>
        <ToolbarSecondaryGroup>
          <EventsModalButton
            id="cluster-events-button"
            entityKind="cluster"
            cluster={cluster}
            title="Cluster Events"
            variant={ButtonVariant.link}
            style={{ textAlign: 'right' }}
          >
            View Cluster Events
          </EventsModalButton>
        </ToolbarSecondaryGroup>
      </ClusterToolbar>
    </>
  );

  return <ClusterWizardStep footer={footer}>{content}</ClusterWizardStep>;
};

export default BaremetalInventory;
