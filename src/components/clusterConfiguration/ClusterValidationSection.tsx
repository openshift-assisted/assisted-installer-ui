import React from 'react';
import _ from 'lodash';
import { FormikErrors } from 'formik';
import {
  AlertGroup,
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Split,
  SplitItem,
  Flex,
  FlexItem,
  List,
  ListItem,
} from '@patternfly/react-core';
import { TimesIcon } from '@patternfly/react-icons';
import { Cluster } from '../../api/types';
import { NetworkConfigurationValues, Validation, ValidationsInfo } from '../../types/clusters';
import { CLUSTER_FIELD_LABELS } from '../../config/constants';
import { stringToJSON } from '../../api/utils';

import './ClusterValidationSection.css';
import { getWizardStepClusterValidationsInfo } from '../clusterWizard/wizardTransition';
import ClusterWizardContext from '../clusterWizard/ClusterWizardContext';

type ClusterValidationSectionProps = {
  cluster: Cluster;
  dirty: boolean;
  formErrors: FormikErrors<NetworkConfigurationValues>;
  onClose: () => void;
};

const ClusterValidationSection: React.FC<ClusterValidationSectionProps> = ({
  cluster,
  dirty,
  formErrors,
  onClose,
}) => {
  const prevReadyRef = React.useRef<boolean>();
  const errorFields = Object.keys(formErrors);
  const ready = cluster.status === 'ready' && !errorFields.length && !dirty;
  const { currentStepId } = React.useContext(ClusterWizardContext);

  const { failedValidations } = React.useMemo(() => {
    const validationsInfo = stringToJSON<ValidationsInfo>(cluster.validationsInfo) || {};
    const reducedValidationsInfo = getWizardStepClusterValidationsInfo(
      validationsInfo,
      currentStepId,
    );
    const flattenedValues = _.values(reducedValidationsInfo).flat() as Validation[];
    return {
      pendingValidations: flattenedValues.filter((validation) => validation.status === 'pending'),
      failedValidations: flattenedValues.filter((validation) => validation.status === 'failure'),
    };
  }, [cluster.validationsInfo, currentStepId]);

  // When cluster becomes ready, close this section
  React.useEffect(() => {
    if (prevReadyRef.current === false && ready === true) {
      onClose();
    } else {
      prevReadyRef.current = ready;
    }
  });

  const isContentToDisplay =
    (!errorFields.length && dirty) || !!errorFields.length || !!failedValidations.length;
  return (
    <Split>
      <SplitItem isFilled>
        <AlertGroup className="cluster-validation-section">
          {!cluster.validationsInfo && (
            <Alert
              variant={AlertVariant.info}
              title="Cluster validations are initializing"
              isInline
            >
              Please hold on till backgroud checks are started.
            </Alert>
          )}
          {!errorFields.length && dirty && (
            <Alert
              variant={AlertVariant.info}
              title="There are unsaved changes to the cluster configuration"
              isInline
            >
              Please save or discard the pending cluster configuration changes.
            </Alert>
          )}
          {!!errorFields.length && (
            <Alert
              variant={AlertVariant.danger}
              title="Provided cluster configuration is not valid"
              isInline
            >
              The following fields are not valid:{' '}
              {errorFields.map((field: string) => CLUSTER_FIELD_LABELS[field]).join(', ')}.
            </Alert>
          )}
          {!!failedValidations.length && (
            <Alert
              variant={AlertVariant.warning}
              title="Cluster is not ready to be installed yet"
              isInline
            >
              <Flex spaceItems={{ default: 'spaceItemsSm' }} direction={{ default: 'column' }}>
                <FlexItem>The following requirements must be met:</FlexItem>
                <FlexItem>
                  <List>
                    {failedValidations.map((validation) => (
                      <ListItem key={validation.id}>{validation.message}</ListItem>
                    ))}
                  </List>
                </FlexItem>
              </Flex>
            </Alert>
          )}
          {!isContentToDisplay && !!cluster.validationsInfo && (
            <Alert variant={AlertVariant.info} title="Host validations are failing" isInline>
              All relevant cluster-level validations are passing, inspect individual hosts.
            </Alert>
          )}
        </AlertGroup>
      </SplitItem>
      <SplitItem>
        <Button variant={ButtonVariant.plain} onClick={onClose} aria-label="Close">
          <TimesIcon />
        </Button>
      </SplitItem>
    </Split>
  );
};

export default ClusterValidationSection;
