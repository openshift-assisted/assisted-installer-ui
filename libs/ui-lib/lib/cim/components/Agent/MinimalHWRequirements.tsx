import * as React from 'react';
import {
	Button,
	ButtonVariant
} from '@patternfly/react-core';
import {
	Modal,
	ModalVariant
} from '@patternfly/react-core/deprecated';
import { InfoCircleIcon } from '@patternfly/react-icons/dist/js/icons/info-circle-icon';

import { ConfigMapK8sResource } from '../../types';
import HostRequirements, {
  HostRequirementsListProps,
} from '../../../common/components/hosts/HostRequirements';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { UiIcon } from '../../../common';

type HostData = {
  cpu_cores: number;
  ram_mib: number;
  disk_size_gb: number;
};

type HWRequirements = {
  version: string;
  master: HostData;
  worker: HostData;
  sno: HostData;
};

type MinimalHWRequirementsProps = {
  aiConfigMap: ConfigMapK8sResource;
  isSNOCluster?: boolean;
};

type MinimalHWRequirementsModalProps = MinimalHWRequirementsProps & {
  isOpen: boolean;
  onClose: () => void;
};

export const getHWRequirements = (aiConfigMap: ConfigMapK8sResource): HostRequirementsListProps => {
  let hwRequirements: HWRequirements | undefined;
  try {
    const hwData = JSON.parse(
      aiConfigMap.data?.HW_VALIDATOR_REQUIREMENTS || '[]',
    ) as HWRequirements[];

    hwRequirements = hwData.find((req: { version?: string }) => req.version === 'default');
  } catch {
    // console.error('Failed to parse hw requirements config map');
    hwRequirements = undefined;
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
        <UiIcon size="sm" status="warning" icon={<InfoCircleIcon />} />
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
