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
import { Cluster, ClusterStatusEnum } from '../../api/types';
import { ClusterConfigurationValues, ValidationsInfo } from '../../types/clusters';
import { CLUSTER_FIELD_LABELS } from '../../config/constants';
import { stringToJSON } from '../../api/utils';
import './ClusterValidationSection.css';

type ClusterValidationSectionProps = {
  cluster: Cluster;
  dirty: boolean;
  formErrors: FormikErrors<ClusterConfigurationValues>;
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
  const ready = cluster.status === ClusterStatusEnum.READY && !errorFields.length && !dirty;

  const { failedValidations } = React.useMemo(() => {
    const validationsInfo = stringToJSON<ValidationsInfo>(cluster.validationsInfo) || {
      hostsData: [],
      network: [],
    };
    const flattenedValues = _.values(validationsInfo).flat();
    return {
      pendingValidations: flattenedValues.filter((validation) => validation.status === 'pending'),
      failedValidations: flattenedValues.filter((validation) => validation.status === 'failure'),
    };
  }, [cluster.validationsInfo]);

  // When cluster becomes ready, close this section
  React.useEffect(() => {
    if (prevReadyRef.current === false && ready === true) {
      onClose();
    } else {
      prevReadyRef.current = ready;
    }
  });

  return (
    <Split>
      <SplitItem isFilled>
        <AlertGroup className="cluster-validation-section">
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
