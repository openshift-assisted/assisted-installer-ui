import React from 'react';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { ocmClient } from '../../../api';
import { CLUSTER_MANAGER_SITE_LINK, PULL_SECRET_INFO_LINK } from '../../../config';
import TextAreaField from './TextAreaField';
import PopoverIcon from '../PopoverIcon';

export type PullSecretFieldProps = {
  pullSecret?: string;
  LabelIcon: React.ComponentType;
};

export const PullSecretInfo: React.FC = () => (
  <PopoverIcon
    noVerticalAlign
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

const PullSecretField: React.FC = () => (
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
    rows={10}
    isRequired
  />
);

export default PullSecretField;
