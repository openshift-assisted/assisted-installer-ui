import React from 'react';
import { List, ListItem, Content,  } from '@patternfly/react-core';
import { DISK_WRITE_SPEED_LINK, ErrorState, ExternalLink, LoadingState } from '../../../common';
import { useClusterPreflightRequirements } from '../../hooks';
import { fileSize } from '../../../common/utils';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';

const parseRAM = (ramMib: number) => fileSize(ramMib * 1024 * 1024, 2, 'iec');

type PreflightRequirementsContentProps = {
  clusterId: Cluster['id'];
  isSingleNode: boolean;
  isAddingHosts: boolean;
};

const HostRequirementsContent = ({
  clusterId,
  isSingleNode,
  isAddingHosts,
}: PreflightRequirementsContentProps) => {
  const { preflightRequirements, error, isLoading } = useClusterPreflightRequirements(clusterId);

  if (isLoading) {
    return <LoadingState content="Loading hardware requirements ..." />;
  }
  if (error) {
    return <ErrorState />;
  }

  const masterQuantitativeData = preflightRequirements?.ocp?.master?.quantitative;
  const masterCpuCores = masterQuantitativeData?.cpuCores || 4;
  const masterRam = parseRAM(masterQuantitativeData?.ramMib || 16 * 1024);
  const masterDiskSizeGb = masterQuantitativeData?.diskSizeGb || 100;
  const contentForControlPlaneNodes = `${masterCpuCores} CPU cores, ${masterRam} RAM, and ${masterDiskSizeGb} GB disk size.`;

  const workerQuantitativeData = preflightRequirements?.ocp?.worker?.quantitative;
  const workerCpuCores = workerQuantitativeData?.cpuCores || 2;
  const workerRam = parseRAM(workerQuantitativeData?.ramMib || 16 * 1024);
  const workerDiskSizeGb = workerQuantitativeData?.diskSizeGb || 100;
  const contentForWorkerNodes = `${workerCpuCores} CPU cores, ${workerRam} RAM, and ${workerDiskSizeGb} GB disk size.`;

  if (isAddingHosts) {
    return (
      <Content>
        <Content component={'p'}>{`Worker hosts must have at least ${contentForWorkerNodes}`}</Content>
      </Content>
    );
  }

  let content: JSX.Element;
  if (isSingleNode) {
    content = (
      <List>
        <ListItem>{`One host is required with at least ${contentForControlPlaneNodes}`}</ListItem>
        <ListItem>Operators might require additional resources.</ListItem>
      </List>
    );
  } else {
    content = (
      <List>
        <ListItem>{`Control plane nodes: At least ${contentForControlPlaneNodes}`}</ListItem>
        <ListItem>{`Workers: At least ${contentForWorkerNodes}`}</ListItem>
        <ListItem>
          Also note that each host's disk write speed should meet the minimum requirements to run
          OpenShift.
          <br />
          <ExternalLink href={DISK_WRITE_SPEED_LINK}>Learn more</ExternalLink>
        </ListItem>
        <ListItem>Operators might require additional resources.</ListItem>
      </List>
    );
  }

  return content;
};

export default HostRequirementsContent;
