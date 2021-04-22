import React from 'react';
import {
  Text,
  TextContent,
  Button,
  Stack,
  StackItem,
  List,
  ListItem,
} from '@patternfly/react-core';
import {
  Cluster,
  PreflightHardwareRequirements,
  HostRequirements as HostRequirementsType,
} from '../../api/types';
import { DiscoveryImageModalButton } from './discoveryImageModal';
import { DiscoveryTroubleshootingModal } from './DiscoveryTroubleshootingModal';
import HostsDiscoveryTable from '../hosts/HostsDiscoveryTable';
import { useFeature } from '../../features/featureGate';
import CheckboxField from '../ui/formik/CheckboxField';
import { isSingleNodeCluster } from '../clusters/utils';
import InformationAndAlerts from './InformationAndAlerts';
import DiscoveryInstructions from './DiscoveryInstructions';
import { PopoverIcon } from '../ui';
import { getClusterPreflightRequirements, getErrorMessage, handleApiError } from '../../api';
import { addAlert } from '../../features/alerts/alertsSlice';
import { OPERATOR_NAME_CNV } from '../../config';

const HostRequirementsContent = ({
  worker = {},
  master = {},
}: {
  worker?: HostRequirementsType['worker'];
  master?: HostRequirementsType['master'];
}) => (
  <Text component="p">
    Three master hosts are required with at least {master.cpuCores || 4} CPU cores,{' '}
    {master.ramGib || 16} GiB of RAM, and {master.diskSizeGb || 120} GB of filesystem storage each.
    Two or more additional worker hosts are recommended with at least {worker.cpuCores || 2} CPU
    cores, {worker.ramGib || 8} GiB of RAM, and {worker.diskSizeGb || 120} GB of filesystem storage
    each.
  </Text>
);

const SingleHostRequirementsContent = ({
  master = {},
}: {
  master?: HostRequirementsType['master'];
}) => (
  <Text component="p">
    One host is required with at least {master.cpuCores || 4} CPU cores, {master.ramGib || 16} GiB
    of RAM, and {master.diskSizeGb || 120} GB of filesystem storage.
  </Text>
);

const OCSLabel: React.FC = () => (
  <>
    Install OpenShift Container Storage
    {/* TODO(mlibra): List of OCS requierements is stabilizing now - https://issues.redhat.com/browse/MGMT-4220 )
    <PopoverIcon headerContent="Additional Requirements" bodyContent={<>FOO BAR </>} />*/}
  </>
);

const CNVLabel: React.FC<{ cluster: Cluster }> = ({ cluster }) => {
  const [clusterPreflightRequirements, setClusterPreflightRequirements] = React.useState<
    PreflightHardwareRequirements
  >();

  React.useEffect(() => {
    const fetchFunc = async () => {
      try {
        const { data } = await getClusterPreflightRequirements(cluster.id);
        setClusterPreflightRequirements(data);
      } catch (e) {
        handleApiError(e, () =>
          addAlert({
            title: 'Failed to retrieve cluster requirements',
            message: getErrorMessage(e),
          }),
        );
      }
    };
    fetchFunc();
  }, [setClusterPreflightRequirements, cluster.id]);

  const cnvRequirements = clusterPreflightRequirements?.operators?.find(
    (operatorRequirements) => operatorRequirements.operatorName === OPERATOR_NAME_CNV,
  );

  const workerRequirements = cnvRequirements?.requirements?.worker?.quantitative;
  const masterRequirements = cnvRequirements?.requirements?.master?.quantitative;

  return (
    <>
      Install OpenShift Virtualization{' '}
      <PopoverIcon
        headerContent="Additional Requirements"
        className="margin-left-md"
        hasAutoWidth
        maxWidth="50rem"
        bodyContent={
          <TextContent>
            <Text></Text>
            <List>
              <ListItem>
                enabled CPU virtualization support in BIOS (Intel-VT / AMD-V) on all worker nodes
              </ListItem>
              <ListItem>
                worker node requires additional {workerRequirements?.ramMib || 360} MiB of memory{' '}
                {workerRequirements?.diskSizeGb ? ',' : ' and'} {workerRequirements?.cpuCores || 2}{' '}
                CPUs
                {workerRequirements?.diskSizeGb
                  ? ` and ${workerRequirements?.diskSizeGb} storage space`
                  : ''}
              </ListItem>
              <ListItem>
                master node requires additional {masterRequirements?.ramMib || 150} MiB of memory{' '}
                {masterRequirements?.diskSizeGb ? ',' : ' and'} {masterRequirements?.cpuCores || 4}{' '}
                CPUs
                {masterRequirements?.diskSizeGb
                  ? ` and ${masterRequirements?.diskSizeGb} storage space`
                  : ''}
              </ListItem>
              {/* TODO(mlibra): Wording of storage requirements needs special care - https://issues.redhat.com/browse/MGMT-5284
              <ListItem>either Cluster or Local Storage (the LSO operator will be added by default)</ListItem>
              */}
            </List>
          </TextContent>
        }
      />
    </>
  );
};

const HostInventory: React.FC<{ cluster: Cluster }> = ({ cluster }) => {
  const [isDiscoveryHintModalOpen, setDiscoveryHintModalOpen] = React.useState(false);
  const isOpenshiftClusterStorageEnabled = useFeature('ASSISTED_INSTALLER_OCS_FEATURE');
  const isContainerNativeVirtualizationEnabled = useFeature('ASSISTED_INSTALLER_CNV_FEATURE');
  const isSNO = isSingleNodeCluster(cluster);

  return (
    <Stack hasGutter>
      <StackItem>
        <TextContent>
          <Text component="h2">Host Discovery</Text>
        </TextContent>
      </StackItem>
      <StackItem>
        <TextContent>
          <DiscoveryInstructions />
          <Text component="p">
            <DiscoveryImageModalButton
              ButtonComponent={Button}
              cluster={cluster}
              idPrefix="host-inventory"
            />
          </Text>
          {isContainerNativeVirtualizationEnabled && (
            <CheckboxField
              name="useContainerNativeVirtualization"
              label={<CNVLabel cluster={cluster} />}
              helperText="Run virtual machines along containers."
            />
          )}
          {isOpenshiftClusterStorageEnabled && !isSNO && (
            <CheckboxField
              name="useExtraDisksForLocalStorage"
              label={<OCSLabel />}
              helperText="Persistent software-defined storage for hybrid applications."
            />
          )}
          <InformationAndAlerts
            cluster={cluster}
            HostRequirementsContent={
              isSNO ? SingleHostRequirementsContent : HostRequirementsContent
            }
            setDiscoveryHintModalOpen={setDiscoveryHintModalOpen}
          />
        </TextContent>
        <HostsDiscoveryTable
          cluster={cluster}
          setDiscoveryHintModalOpen={setDiscoveryHintModalOpen}
        />
        <DiscoveryTroubleshootingModal
          isOpen={isDiscoveryHintModalOpen}
          setDiscoveryHintModalOpen={setDiscoveryHintModalOpen}
        />
      </StackItem>
    </Stack>
  );
};

export default HostInventory;
