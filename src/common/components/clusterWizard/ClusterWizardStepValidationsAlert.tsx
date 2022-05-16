import lodashValues from 'lodash/values';
import React from 'react';
import {
  Alert,
  AlertGroup,
  AlertVariant,
  Flex,
  FlexItem,
  List,
  ListItem,
} from '@patternfly/react-core';
import { WizardStepsValidationMap } from './validationsInfoUtils';
import { Cluster } from '../../api/types';
import { ValidationsInfo } from '../../types/clusters';
import { ClusterWizardStepHostStatusDeterminationObject, Validation } from '../../types/hosts';
import {
  getWizardStepClusterStatus,
  getWizardStepClusterValidationsInfo,
} from './validationsInfoUtils';

type ClusterWizardStepValidationsAlertProps<ClusterWizardStepsType extends string> = {
  currentStepId: ClusterWizardStepsType;
  validationsInfo?: ValidationsInfo;
  clusterStatus: Cluster['status'];
  hosts: ClusterWizardStepHostStatusDeterminationObject[];
  wizardStepsValidationsMap: WizardStepsValidationMap<ClusterWizardStepsType>;
  children?: React.ReactNode;
};

const ClusterWizardStepValidationsAlert = <ClusterWizardStepsType extends string>({
  currentStepId,
  clusterStatus,
  validationsInfo,
  hosts,
  wizardStepsValidationsMap,
  children,
}: ClusterWizardStepValidationsAlertProps<ClusterWizardStepsType>) => {
  const { failedClusterValidations } = React.useMemo(() => {
    const reducedValidationsInfo = getWizardStepClusterValidationsInfo(
      validationsInfo || {},
      currentStepId,
      wizardStepsValidationsMap,
    );
    const flattenedValues = lodashValues(reducedValidationsInfo).flat();
    return {
      pendingClusterValidations: flattenedValues.filter(
        (validation) => validation?.status === 'pending',
      ),
      failedClusterValidations: flattenedValues.filter(
        (validation) => validation?.status === 'failure',
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
        <Alert variant={AlertVariant.info} title="Cluster validations are initializing." isInline>
          Please hold on till background checks are started.
        </Alert>
      )}
      {!isClusterReady && (
        <AlertGroup>
          {children}
          <Alert variant={AlertVariant.warning} title="Cluster is not ready yet." isInline>
            {!!failedClusterValidations.length && (
              <Flex spaceItems={{ default: 'spaceItemsSm' }} direction={{ default: 'column' }}>
                <FlexItem>The following requirements must be met:</FlexItem>
                <FlexItem>
                  <List>
                    {(failedClusterValidations.filter(Boolean) as Validation[]).map(
                      (validation) => (
                        <ListItem key={validation.id}>{validation.message}</ListItem>
                      ),
                    )}
                  </List>
                </FlexItem>
              </Flex>
            )}
          </Alert>
        </AlertGroup>
      )}
    </>
  );
};

export default ClusterWizardStepValidationsAlert;
