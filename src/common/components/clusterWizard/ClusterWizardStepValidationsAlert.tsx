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
import { checkHostValidations, WizardStepsValidationMap } from './validationsInfoUtils';
import { Cluster } from '../../api/types';
import { ValidationsInfo } from '../../types/clusters';
import { ValidationsInfo as HostValidationsInfo } from '../../types/hosts';
import { ClusterWizardStepHostStatusDeterminationObject, Validation } from '../../types/hosts';
import {
  getWizardStepClusterStatus,
  getWizardStepClusterValidationsInfo,
} from './validationsInfoUtils';
import { useTranslation } from '../../hooks/use-translation-wrapper';
import { stringToJSON } from '../../api';

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
  const { failedClusterValidations, failedHostnameValidations } = React.useMemo(() => {
    const reducedValidationsInfo = getWizardStepClusterValidationsInfo(
      validationsInfo || {},
      currentStepId,
      wizardStepsValidationsMap,
    );

    const flattenedValues = lodashValues(reducedValidationsInfo).flat();

    const hostnameValidations = hosts.some((host) => {
      const validations =
        typeof host.validationsInfo === 'string'
          ? stringToJSON<HostValidationsInfo>(host.validationsInfo)
          : host.validationsInfo;

      return !checkHostValidations(validations || {}, ['hostname-valid', 'hostname-unique']);
    });

    return {
      failedClusterValidations: flattenedValues.filter(
        (validation) => validation?.status === 'failure',
      ),
      failedHostnameValidations: hostnameValidations,
    };
  }, [validationsInfo, currentStepId, wizardStepsValidationsMap, hosts]);

  const isClusterReady =
    getWizardStepClusterStatus(
      currentStepId,
      wizardStepsValidationsMap,
      { status: clusterStatus, validationsInfo: validationsInfo || {} },
      hosts,
    ) === 'ready';
  const { t } = useTranslation();
  return (
    <>
      {!validationsInfo && (
        <Alert variant={AlertVariant.info} title="Cluster validations are initializing." isInline>
          {t('ai:Please hold on till background checks are started.')}
        </Alert>
      )}
      {!isClusterReady && (
        <AlertGroup>
          {children}
          <Alert variant={AlertVariant.warning} title="Cluster is not ready yet." isInline>
            <Flex spaceItems={{ default: 'spaceItemsSm' }} direction={{ default: 'column' }}>
              {!!failedClusterValidations.length && (
                <>
                  <FlexItem>{t('ai:The following requirements must be met:')}</FlexItem>
                  <FlexItem>
                    <List>
                      {(failedClusterValidations.filter(Boolean) as Validation[]).map(
                        (validation) => (
                          <ListItem key={validation.id}>{validation.message}</ListItem>
                        ),
                      )}
                    </List>
                  </FlexItem>
                </>
              )}
              {failedHostnameValidations && (
                <FlexItem>
                  {t(
                    'ai:The cluster is not ready yet. Some hosts have an ineligible name. To change the hostname, click on it.',
                  )}
                </FlexItem>
              )}
            </Flex>
          </Alert>
        </AlertGroup>
      )}
    </>
  );
};

export default ClusterWizardStepValidationsAlert;
