import React from 'react';
import { Checkbox } from '@patternfly/react-core';
import { ClusterCreateParams, ocmClient } from '../../api';
import { useFormikContext } from 'formik';
import PullSecretField, { PullSecretInfo } from '../ui/formik/PullSecretField';

export type PullSecretProps = {
  pullSecret?: string;
};

const PullSecret: React.FC<PullSecretProps> = ({ pullSecret }) => {
  // Fetched pull secret will never change - see LoadingState in NewCluster
  const [isExpanded, setExpanded] = React.useState(!pullSecret);
  const { setFieldValue } = useFormikContext<ClusterCreateParams>();

  if (ocmClient) {
    const onCheckboxChange = () => {
      if (isExpanded) {
        // about to collapse, reset to original value
        setFieldValue('pullSecret', pullSecret);
      }
      setExpanded(!isExpanded);
    };

    return (
      <>
        <Checkbox
          id="checkbox-pull-secret"
          className="pf-u-display-inline-flex"
          aria-label="edit pull secret"
          isChecked={isExpanded}
          onChange={onCheckboxChange}
          label={
            <>
              Edit pull secret <PullSecretInfo />
            </>
          }
        />
        {isExpanded && <PullSecretField />}
      </>
    );
  }

  return <PullSecretField />;
};

export default PullSecret;
