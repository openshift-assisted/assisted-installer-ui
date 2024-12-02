import lodashValues from 'lodash-es/values.js';
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
import {
  Cluster,
  LastInstallationPreparation,
} from '@openshift-assisted/types/assisted-installer-service';
import { ValidationsInfo } from '../../types/clusters';
import { ValidationsInfo as HostValidationsInfo } from '../../types/hosts';
import { ClusterWizardStepHostStatusDeterminationObject } from '../../types/hosts';
import {
  getWizardStepClusterStatus,
  getWizardStepClusterValidationsInfo,
} from './validationsInfoUtils';
import { useTranslation } from '../../hooks/use-translation-wrapper';
import { stringToJSON } from '../../utils';
import { UISettingsValues } from '../../types';

type ClusterWizardStepValidationsAlertProps<ClusterWizardStepsType extends string> = {
  currentStepId: ClusterWizardStepsType;
  validationsInfo?: ValidationsInfo;
  clusterStatus: Cluster['status'];
  hosts: ClusterWizardStepHostStatusDeterminationObject[];
  wizardStepsValidationsMap: WizardStepsValidationMap<ClusterWizardStepsType>;
  children?: React.ReactNode;
  lastInstallationPreparation?: LastInstallationPreparation | undefined;
  uiSettings?: UISettingsValues;
};

const ClusterWizardStepValidationsAlert = <ClusterWizardStepsType extends string>({
  currentStepId,
  clusterStatus,
  validationsInfo,
  hosts,
  wizardStepsValidationsMap,
  children,
  lastInstallationPreparation,
  uiSettings,
}: ClusterWizardStepValidationsAlertProps<ClusterWizardStepsType>) => {
  const [showInstallAlert, setShowInstallAlert] = React.useState(
    lastInstallationPreparation && lastInstallationPreparation.status === 'failed',
  );

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

  React.useEffect(() => {
    if (
      lastInstallationPreparation?.reason?.includes('manifest') &&
      uiSettings?.customManifestsUpdated
    ) {
      setShowInstallAlert(false);
    }
  }, [lastInstallationPreparation, uiSettings]);

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
      {!isClusterReady && (
        <AlertGroup>
          {children}
          <Alert variant={AlertVariant.warning} title="Cluster is not ready yet." isInline>
            <Flex spaceItems={{ default: 'spaceItemsSm' }} direction={{ default: 'column' }}>
              {!!failedClusterValidations.length && (
                <>
                  <FlexItem>
                    {t('ai:The following requirement must be met:', {
                      count: failedClusterValidations.length,
                    })}
                  </FlexItem>
                  <FlexItem>
                    {failedClusterValidations.length === 1 ? (
                      failedClusterValidations[0].message
                    ) : (
                      <List>
                        {failedClusterValidations.map((validation) => (
                          <ListItem key={validation.id}>{validation.message}</ListItem>
                        ))}
                      </List>
                    )}
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
      {showInstallAlert && (
        <AlertGroup>
          <Alert variant={AlertVariant.danger} title="Error in preparing installation" isInline>
            <Flex spaceItems={{ default: 'spaceItemsSm' }} direction={{ default: 'column' }}>
              <FlexItem>{lastInstallationPreparation?.reason}</FlexItem>
            </Flex>
          </Alert>
        </AlertGroup>
      )}
    </>
  );
};

export default ClusterWizardStepValidationsAlert;
