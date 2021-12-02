import _ from 'lodash';
import React from 'react';
import { Alert, AlertVariant, Flex, FlexItem, List, ListItem } from '@patternfly/react-core';
import { WizardStepsValidationMap } from './validationsInfoUtils';
import { Cluster } from '../../api/types';
import { Validation, ValidationsInfo } from '../../types/clusters';
import { ClusterWizardStepHostStatusDeterminationObject } from '../../types/hosts';
import {
  getWizardStepClusterStatus,
  getWizardStepClusterValidationsInfo,
} from './validationsInfoUtils';

type ClusterWizardStepValidationsAlertProps = {
  currentStepId: string;
  validationsInfo?: ValidationsInfo;
  clusterStatus: Cluster['status'];
  hosts: ClusterWizardStepHostStatusDeterminationObject[];
  wizardStepsValidationsMap: WizardStepsValidationMap;
};

const ClusterWizardStepValidationsAlert = ({
  currentStepId,
  clusterStatus,
  validationsInfo,
  hosts,
  wizardStepsValidationsMap,
}: ClusterWizardStepValidationsAlertProps) => {
  const { failedClusterValidations } = React.useMemo(() => {
    const reducedValidationsInfo = getWizardStepClusterValidationsInfo(
      validationsInfo || {},
      currentStepId,
      wizardStepsValidationsMap,
    );
    const flattenedValues = _.values(reducedValidationsInfo).flat() as Validation[];
    return {
      pendingClusterValidations: flattenedValues.filter(
        (validation) => validation.status === 'pending',
      ),
      failedClusterValidations: flattenedValues.filter(
        (validation) => validation.status === 'failure',
      ),
    };
  }, [validationsInfo, currentStepId, wizardStepsValidationsMap]);

  const isClusterReady =
    getWizardStepClusterStatus(
      currentStepId,
      wizardStepsValidationsMap,
      { status: clusterStatus, validationsInfo: validationsInfo || {} },
      hosts,
    ) === 'ready';

  return (
    <>
      {!validationsInfo && (
        <Alert variant={AlertVariant.info} title="Cluster validations are initializing" isInline>
          Please hold on till background checks are started.
        </Alert>
      )}
      {!isClusterReady && (
        <Alert variant={AlertVariant.warning} title="Cluster is not ready yet" isInline>
          {!!failedClusterValidations.length && (
            <Flex spaceItems={{ default: 'spaceItemsSm' }} direction={{ default: 'column' }}>
              <FlexItem>The following requirements must be met:</FlexItem>
              <FlexItem>
                <List>
                  {failedClusterValidations.map((validation) => (
                    <ListItem key={validation.id}>{validation.message}</ListItem>
                  ))}
                </List>
              </FlexItem>
            </Flex>
          )}
        </Alert>
      )}
    </>
  );
};

export default ClusterWizardStepValidationsAlert;
