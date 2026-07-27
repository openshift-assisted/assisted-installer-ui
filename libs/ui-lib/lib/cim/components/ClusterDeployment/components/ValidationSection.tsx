import React from 'react';
import { AlertGroup } from '@patternfly/react-core';
import { Cluster } from '@openshift-assisted/types/./assisted-installer-service';
import { ValidationsInfo, ClusterWizardStepValidationsAlert } from '../../../../common';
import { ClusterWizardStepHostStatusDeterminationObject } from '../../../../common/types/hosts';
import ValidationsRunningAlert from '../../common/ValidationsRunningAlert';
import { wizardStepsValidationsMap } from '../wizardTransition';
import { ClusterDeploymentWizardStepsType } from '../types';

type ValidationSectionProps = {
  requireProxy?: boolean;
  currentStepId: ClusterDeploymentWizardStepsType;
  validationsInfo?: ValidationsInfo;
  clusterStatus?: Cluster['status'];
  hosts: ClusterWizardStepHostStatusDeterminationObject[];
  children: React.ReactNode;
};

export const ValidationSection = ({
  currentStepId,
  clusterStatus,
  validationsInfo,
  hosts,
  children,
}: ValidationSectionProps) => {
  return (
    <AlertGroup>
      {children}
      {clusterStatus && (
        <ClusterWizardStepValidationsAlert
          currentStepId={currentStepId}
          clusterStatus={clusterStatus}
          hosts={hosts}
          validationsInfo={validationsInfo}
          wizardStepsValidationsMap={wizardStepsValidationsMap}
        >
          <ValidationsRunningAlert />
        </ClusterWizardStepValidationsAlert>
      )}
    </AlertGroup>
  );
};
