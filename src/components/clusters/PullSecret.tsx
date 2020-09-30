import React from 'react';
import { Checkbox } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { ClusterCreateParams, ocmClient } from '../../api';
import { CLUSTER_MANAGER_SITE_LINK, PULL_SECRET_INFO_LINK } from '../../config';
import { TextAreaField } from '../ui';
import { useFormikContext } from 'formik';
import PopoverIcon from '../ui/PopoverIcon';

export type PullSecretProps = {
  pullSecret?: string;
};

const ClusterManagerSiteLink = () => (
  <a href={CLUSTER_MANAGER_SITE_LINK} target="_blank" rel="noopener noreferrer">
    OpenShift Cluster Manager <ExternalLinkAltIcon />
  </a>
);

const PullSecretInfoLink = () => (
  <a href={PULL_SECRET_INFO_LINK} target="_blank" rel="noopener noreferrer">
    Learn more about pull secrets <ExternalLinkAltIcon />.
  </a>
);

const pullSecretHelperText = ocmClient ? (
  <>
    Your Red Hat account's pull secret is used by default.&nbsp;
    <PullSecretInfoLink />
  </>
) : (
  <>
    A Red Hat account's pull secret can be found in &nbsp;
    <ClusterManagerSiteLink />
  </>
);

const PullSecretInfo = () => (
  <PopoverIcon
    bodyContent={
      <>
        Pull secrets are used to download OpenShift Container Platform components and connect
        clusters to a Red Hat account.&nbsp;
        {ocmClient ? (
          <PullSecretInfoLink />
        ) : (
          <>
            Pull secrets can be found in&nbsp;
            <ClusterManagerSiteLink />
          </>
        )}
      </>
    }
  />
);

const PullSecret: React.FC<PullSecretProps> = ({ pullSecret }) => {
  // Fetched pull secret will never change - see LoadingState in NewCluster
  const [isExpanded, setExpanded] = React.useState(!pullSecret);
  const { setFieldValue } = useFormikContext<ClusterCreateParams>();

  const textArea = (
    <TextAreaField
      name="pullSecret"
      label="Pull Secret"
      labelIcon={ocmClient ? undefined : <PullSecretInfo />}
      getErrorText={(error) => (
        <>
          {error} {pullSecretHelperText}
        </>
      )}
      helperText={pullSecretHelperText}
      isRequired
    />
  );

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
        {isExpanded && textArea}
      </>
    );
  }

  return textArea;
};

export default PullSecret;
