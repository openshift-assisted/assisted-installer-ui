import { Button, ButtonVariant, Modal, ModalVariant } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';
import * as React from 'react';
import { ConfigMapK8sResource } from '../../types';
import HostRequirements, {
  HostRequirementsListProps,
} from '../../../common/components/hosts/HostRequirements';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';

export const getHWRequirements = (aiConfigMap: ConfigMapK8sResource): HostRequirementsListProps => {
  let hwRequirements;
  try {
    hwRequirements = JSON.parse(aiConfigMap.data?.HW_VALIDATOR_REQUIREMENTS || '[]')?.find(
      // eslint-disable-next-line
      (req: any) => req.version === 'default',
    );
  } catch {
    hwRequirements = {};
  }
  return {
    master: {
      cpuCores: hwRequirements?.master?.cpu_cores,
      ramMib: hwRequirements?.master?.ram_mib,
      diskSizeGb: hwRequirements?.master?.disk_size_gb,
    },
    worker: {
      cpuCores: hwRequirements?.worker?.cpu_cores,
      ramMib: hwRequirements?.worker?.ram_mib,
      diskSizeGb: hwRequirements?.worker?.disk_size_gb,
    },
    sno: {
      cpuCores: hwRequirements?.sno?.cpu_cores,
      ramMib: hwRequirements?.sno?.ram_mib,
      diskSizeGb: hwRequirements?.sno?.disk_size_gb,
    },
  };
};

type MinimalHWRequirementsProps = {
  aiConfigMap: ConfigMapK8sResource;
  isSNOCluster?: boolean;
};

const MinimalHWRequirements: React.FC<MinimalHWRequirementsProps> = ({
  aiConfigMap,
  isSNOCluster,
}) => {
  const [isHostRequirementsOpen, setHostRequirementsOpen] = React.useState(false);
  const { t } = useTranslation();
  return (
    <>
      <Button
        variant={ButtonVariant.link}
        onClick={() => setHostRequirementsOpen(true)}
        isInline
        className="host-requirements-link"
      >
        <InfoCircleIcon size="sm" />
        &nbsp;{t('ai:Minimum hardware requirements')}
      </Button>
      <MinimalHWRequirementsModal
        isOpen={isHostRequirementsOpen}
        onClose={() => setHostRequirementsOpen(false)}
        aiConfigMap={aiConfigMap}
        isSNOCluster={isSNOCluster}
      />
    </>
  );
};

type MinimalHWRequirementsModalProps = MinimalHWRequirementsProps & {
  isOpen: boolean;
  onClose: () => void;
};

export const MinimalHWRequirementsModal = ({
  isOpen,
  aiConfigMap,
  isSNOCluster,
  onClose,
}: MinimalHWRequirementsModalProps) => {
  const { t } = useTranslation();
  return (
    <Modal
      title={t('ai:Minimum hardware requirements')}
      isOpen={isOpen}
      actions={[
        <Button key="close" variant={ButtonVariant.primary} onClick={onClose}>
          {t('ai:Close')}
        </Button>,
      ]}
      onClose={onClose}
      variant={ModalVariant.medium}
    >
      <HostRequirements {...getHWRequirements(aiConfigMap)} isSNOCluster={isSNOCluster} />
    </Modal>
  );
};

export default MinimalHWRequirements;
