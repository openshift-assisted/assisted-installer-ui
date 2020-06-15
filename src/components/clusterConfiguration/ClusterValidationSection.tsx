import React from 'react';
import { FormikErrors } from 'formik';
import {
  AlertGroup,
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Split,
  SplitItem,
  TextList,
  TextListItem,
} from '@patternfly/react-core';
import { TimesIcon } from '@patternfly/react-icons';
import { Cluster } from '../../api/types';
import { validateCluster } from './clusterValidations';
import { ClusterConfigurationValues } from '../../types/clusters';
import { CLUSTER_FIELD_LABELS } from '../../config/constants';
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
  const errors = React.useMemo(() => validateCluster(cluster), [cluster]);
  const errorFields = Object.keys(formErrors);
  const ready = cluster.status === 'ready' && !errors.length && !errorFields.length && !dirty;

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
              Following fields have invalid value set:{' '}
              {errorFields.map((field: string) => CLUSTER_FIELD_LABELS[field]).join(', ')}.
            </Alert>
          )}
          {(cluster.status !== 'ready' || !!errors.length) && (
            <Alert
              variant={AlertVariant.warning}
              title="Cluster is not ready to be installed yet"
              isInline
            >
              {!!errors.length && (
                <TextList>
                  {errors.map((error) => (
                    <TextListItem key={error}>{error}</TextListItem>
                  ))}
                </TextList>
              )}
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
