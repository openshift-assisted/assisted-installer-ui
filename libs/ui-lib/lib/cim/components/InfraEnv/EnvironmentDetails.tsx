import * as React from 'react';
import {
  Button,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Grid,
  GridItem,
  Spinner,
  Content,
  ContentVariants,
  Title,
  TitleSizes,
} from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import { PencilAltIcon } from '@patternfly/react-icons/dist/js/icons/pencil-alt-icon';
import { t_global_color_status_success_default as okColor } from '@patternfly/react-tokens/dist/js/t_global_color_status_success_default';
import { t_global_icon_color_status_warning_default as warningColor } from '@patternfly/react-tokens/dist/js/t_global_icon_color_status_warning_default';

import { architectureData, LabelValue } from '../../../common';
import { InfraEnvK8sResource, SecretK8sResource } from '../../types';
import { AGENT_LOCATION_LABEL_KEY } from '../common';
import EditPullSecretModal, { EditPullSecretModalProps } from '../modals/EditPullSecretModal';
import EditSSHKeyModal, { EditSSHKeyModalProps } from '../modals/EditSSHKeyModal';
import EditNtpSourcesModal, { EditNtpSourcesModalProps } from '../modals/EditNtpSourcesModal';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { EditProxyModalProps } from '../modals/types';
import { EditProxyModal } from '../modals';

type EditItemProps = {
  title: string;
  onEdit: VoidFunction;
  isLoading?: boolean;
  isWarning?: boolean;
  noIcon?: boolean;
};

const EditItem: React.FC<EditItemProps> = ({ title, onEdit, isLoading, isWarning, noIcon }) => {
  let icon = <CheckCircleIcon color={okColor.value} />;
  if (isLoading) {
    icon = <Spinner size="md" />;
  } else if (isWarning) {
    icon = <ExclamationTriangleIcon color={warningColor.value} />;
  }
  const btn = (
    <>
      {title}&nbsp;
      <Button icon={<PencilAltIcon />} variant="plain" onClick={onEdit} />
    </>
  );
  return noIcon ? (
    btn
  ) : (
    <div>
      {icon}
      &nbsp;
      {btn}
    </div>
  );
};

const NotConfigured = () => {
  const { t } = useTranslation();
  return (
    <Content>
      <Content component={ContentVariants.small}>{t('ai:Not configured')}</Content>
    </Content>
  );
};

type EnvironmentDetailsProps = {
  infraEnv: InfraEnvK8sResource;
  fetchSecret: (namespace: string, name: string) => Promise<SecretK8sResource>;
  onEditPullSecret: EditPullSecretModalProps['onSubmit'];
  onEditSSHKey: EditSSHKeyModalProps['onSubmit'];
  onEditNtpSources: EditNtpSourcesModalProps['onSubmit'];
  onEditProxy: EditProxyModalProps['onSubmit'];
  hasAgents: boolean;
  hasBMHs: boolean;
};

const EnvironmentDetails: React.FC<EnvironmentDetailsProps> = ({
  infraEnv,
  fetchSecret,
  onEditPullSecret,
  onEditSSHKey,
  onEditNtpSources,
  hasAgents,
  hasBMHs,
  onEditProxy,
}) => {
  const [editPullSecret, setEditPullSecret] = React.useState(false);
  const [editSSHKey, setEditSSHKey] = React.useState(false);
  const [editNtpSources, setEditNtpSources] = React.useState(false);
  const [pullSecret, setPullSecret] = React.useState<SecretK8sResource>();
  const [pullSecretError, setPullSecretError] = React.useState<string>();
  const [pullSecretLoading, setPullSecretLoading] = React.useState(true);
  const [editProxy, setEditProxy] = React.useState(false);

  const namespace = infraEnv.metadata?.namespace ?? '';
  const pullSecretName = infraEnv.spec?.pullSecretRef?.name ?? '';
  const { t } = useTranslation();
  React.useEffect(() => {
    const fetch = async () => {
      try {
        if (namespace && pullSecretName) {
          const result = await fetchSecret(namespace, pullSecretName);
          setPullSecret(result);
        }
      } catch (err) {
        setPullSecret(undefined);
        // eslint-disable-next-line
        if ((err as any).code !== 404) {
          setPullSecretError((err as Error).message || t('ai:Could not fetch pull secret'));
        }
      } finally {
        setPullSecretLoading(false);
      }
    };
    void fetch();
  }, [namespace, pullSecretName, fetchSecret, editPullSecret, t]);

  const hasProxy =
    infraEnv.spec?.proxy?.httpProxy ||
    infraEnv.spec?.proxy?.httpsProxy ||
    infraEnv.spec?.proxy?.noProxy;

  const arch = infraEnv.spec?.cpuArchitecture
    ? architectureData[infraEnv.spec?.cpuArchitecture]?.label
    : infraEnv.spec?.cpuArchitecture;

  return (
    <>
      <Grid hasGutter>
        <GridItem span={12}>
          <Title headingLevel="h1" size={TitleSizes.lg}>
            {t('ai:Infrastructure environment details')}
          </Title>
        </GridItem>
        <GridItem span={6}>
          <DescriptionList>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('ai:Name')}</DescriptionListTerm>
              <DescriptionListDescription>{infraEnv.metadata?.name}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('ai:Location')}</DescriptionListTerm>
              <DescriptionListDescription>
                {infraEnv.metadata?.labels?.[AGENT_LOCATION_LABEL_KEY] ?? t('ai:No location')}
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('ai:Network type')}</DescriptionListTerm>
              <DescriptionListDescription>
                {infraEnv.metadata?.labels?.networkType === 'static'
                  ? t('ai:Static IP, bridges and bonds')
                  : t('ai:DHCP only')}
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('ai:CPU architecture')}</DescriptionListTerm>
              <DescriptionListDescription>{arch ?? '--'}</DescriptionListDescription>
            </DescriptionListGroup>

            {infraEnv.spec?.osImageVersion && (
              <DescriptionListGroup>
                <DescriptionListTerm>{t('ai:OpenShift version')}</DescriptionListTerm>
                <DescriptionListDescription>
                  {`OpenShift ${infraEnv.spec?.osImageVersion}`}
                </DescriptionListDescription>
              </DescriptionListGroup>
            )}

            <DescriptionListGroup>
              <DescriptionListTerm>{t('ai:Labels')}</DescriptionListTerm>
              <DescriptionListDescription>
                {Object.keys(infraEnv.metadata?.labels || {}).map((k) => (
                  <LabelValue key={k} value={`${k}=${infraEnv.metadata?.labels?.[k] || ''}`} />
                ))}
              </DescriptionListDescription>
            </DescriptionListGroup>
            {infraEnv.metadata?.creationTimestamp && (
              <DescriptionListGroup>
                <DescriptionListTerm>{t('ai:Created at')}</DescriptionListTerm>
                <DescriptionListDescription>
                  {new Date(infraEnv.metadata.creationTimestamp).toString()}
                </DescriptionListDescription>
              </DescriptionListGroup>
            )}
          </DescriptionList>
        </GridItem>
        <GridItem span={6}>
          <DescriptionList>
            <DescriptionListGroup>
              <DescriptionListTerm>
                <EditItem noIcon title={t('ai:Proxy settings')} onEdit={() => setEditProxy(true)} />
              </DescriptionListTerm>
              {!hasProxy ? (
                <NotConfigured />
              ) : (
                <>
                  <DescriptionListTerm>{t('ai:HTTP Proxy URL')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {infraEnv.spec?.proxy?.httpProxy || <NotConfigured />}
                  </DescriptionListDescription>
                  <DescriptionListTerm>{t('ai:HTTPS Proxy URL')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {infraEnv.spec?.proxy?.httpsProxy || <NotConfigured />}
                  </DescriptionListDescription>
                  <DescriptionListTerm>{t('ai:No proxy domains')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {infraEnv.spec?.proxy?.noProxy
                      ?.split(',')
                      .map((k) => <LabelValue key={k} value={`${k}`} />) || <NotConfigured />}
                  </DescriptionListDescription>
                </>
              )}
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('ai:Secret and keys')}</DescriptionListTerm>
              <DescriptionListDescription>
                <>
                  <EditItem
                    title={t('ai:Pull secret')}
                    onEdit={() => setEditPullSecret(true)}
                    isLoading={pullSecretLoading}
                    isWarning={!pullSecret}
                  />
                  <EditItem
                    title={t('ai:SSH public key')}
                    onEdit={() => setEditSSHKey(true)}
                    isWarning={!infraEnv.spec?.sshAuthorizedKey}
                  />
                  <EditItem title={t('ai:NTP sources')} onEdit={() => setEditNtpSources(true)} />
                </>
              </DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </GridItem>
      </Grid>
      <EditPullSecretModal
        isOpen={editPullSecret}
        onClose={() => setEditPullSecret(false)}
        pullSecret={pullSecret}
        pullSecretError={pullSecretError}
        pullSecretLoading={pullSecretLoading}
        onSubmit={onEditPullSecret}
        infraEnv={infraEnv}
        hasAgents={hasAgents}
        hasBMHs={hasBMHs}
      />
      <EditSSHKeyModal
        isOpen={editSSHKey}
        onClose={() => setEditSSHKey(false)}
        infraEnv={infraEnv}
        onSubmit={onEditSSHKey}
        hasAgents={hasAgents}
        hasBMHs={hasBMHs}
      />
      <EditNtpSourcesModal
        isOpen={editNtpSources}
        onClose={() => setEditNtpSources(false)}
        infraEnv={infraEnv}
        onSubmit={onEditNtpSources}
      />
      {editProxy && (
        <EditProxyModal
          onClose={() => setEditProxy(false)}
          infraEnv={infraEnv}
          onSubmit={onEditProxy}
          hasAgents={hasAgents}
          hasBMHs={hasBMHs}
        />
      )}
    </>
  );
};

export default EnvironmentDetails;
