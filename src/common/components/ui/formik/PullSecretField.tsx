import React from 'react';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { CLUSTER_MANAGER_SITE_LINK, PULL_SECRET_INFO_LINK } from '../../../config';
import PopoverIcon from '../PopoverIcon';
import TextAreaField from './TextAreaField';
import { useTranslation } from '../../../hooks/use-translation-wrapper';
import { Trans } from 'react-i18next';

export type PullSecretFieldProps = {
  pullSecret?: string;
  LabelIcon: React.ComponentType;
};

export const PullSecretInfo: React.FC<{ isOcm: boolean }> = ({ isOcm }) => {
  const { t } = useTranslation();
  return (
    <PopoverIcon
      noVerticalAlign
      bodyContent={
        <>
          <Trans t={t}>
            ai:Pull secrets are used to download OpenShift Container Platform components and connect
            clusters to a Red Hat account.{' '}
          </Trans>
          {isOcm ? (
            <PullSecretInfoLink />
          ) : (
            <>
              <Trans t={t}>ai:Pull secrets can be found in</Trans> <ClusterManagerSiteLink />
            </>
          )}
        </>
      }
    />
  );
};

const ClusterManagerSiteLink = () => {
  const { t } = useTranslation();
  return (
    <a href={CLUSTER_MANAGER_SITE_LINK} target="_blank" rel="noopener noreferrer">
      {t('ai:OpenShift Cluster Manager')} <ExternalLinkAltIcon />
    </a>
  );
};

const PullSecretInfoLink = () => {
  const { t } = useTranslation();
  return (
    <a href={PULL_SECRET_INFO_LINK} target="_blank" rel="noopener noreferrer">
      {t('ai:Learn more about pull secrets and view examples')} <ExternalLinkAltIcon />.
    </a>
  );
};

const GetPullSecretHelperText: React.FC<{ isOcm: boolean }> = ({ isOcm }) => {
  const { t } = useTranslation();
  return isOcm ? (
    <PullSecretInfoLink />
  ) : (
    <>
      {t("ai:A Red Hat account's pull secret can be found in ")}&nbsp;
      <ClusterManagerSiteLink />
    </>
  );
};

const PullSecretField: React.FC<{ isOcm: boolean }> = ({ isOcm }) => (
  <TextAreaField
    name="pullSecret"
    label="Pull secret"
    labelIcon={isOcm ? undefined : <PullSecretInfo isOcm={isOcm} />}
    getErrorText={(error) => (
      <>
        {error} <GetPullSecretHelperText isOcm={isOcm} />
      </>
    )}
    helperText={<GetPullSecretHelperText isOcm={isOcm} />}
    rows={10}
    isRequired
  />
);

export default PullSecretField;
