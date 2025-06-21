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
  Text,
  TextContent,
  TextVariants,
  Title,
  TitleSizes,
} from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import { PencilAltIcon } from '@patternfly/react-icons/dist/js/icons/pencil-alt-icon';
import { global_palette_green_500 as okColor } from '@patternfly/react-tokens/dist/js/global_palette_green_500';
import { global_warning_color_100 as warningColor } from '@patternfly/react-tokens/dist/js/global_warning_color_100';

import { architectureData, LabelValue } from '../../../common';
import { InfraEnvK8sResource } from '../../types';
import { AGENT_LOCATION_LABEL_KEY } from '../common';
import EditPullSecretModal from '../modals/EditPullSecretModal';
import EditSSHKeyModal from '../modals/EditSSHKeyModal';
import EditNtpSourcesModal from '../modals/EditNtpSourcesModal';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { EditProxyModal } from '../modals';
import { useSecret } from '../../hooks/useSecret';

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
      <Button variant="plain" onClick={onEdit}>
        <PencilAltIcon />
      </Button>
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
    <TextContent>
      <Text component={TextVariants.small}>{t('ai:Not configured')}</Text>
    </TextContent>
  );
};

type EnvironmentDetailsProps = {
  infraEnv: InfraEnvK8sResource;
  hasAgents: boolean;
  hasBMHs: boolean;
};

const EnvironmentDetails: React.FC<EnvironmentDetailsProps> = ({
  infraEnv,
  hasAgents,
  hasBMHs,
}) => {
  const [editPullSecret, setEditPullSecret] = React.useState(false);
  const [editSSHKey, setEditSSHKey] = React.useState(false);
  const [editNtpSources, setEditNtpSources] = React.useState(false);
  const [editProxy, setEditProxy] = React.useState(false);

  const [pullSecret, pullSecretLoaded, pullSecretError] = useSecret(
    infraEnv.spec?.pullSecretRef?.name
      ? {
          name: infraEnv.spec?.pullSecretRef?.name,
          namespace: infraEnv.metadata?.namespace,
        }
      : null,
  );
  const { t } = useTranslation();

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
                    isLoading={!pullSecretLoaded}
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
      {editPullSecret && (
        <EditPullSecretModal
          onClose={() => setEditPullSecret(false)}
          pullSecret={pullSecret}
          pullSecretError={pullSecretError}
          pullSecretLoading={!pullSecretLoaded}
          infraEnv={infraEnv}
          hasAgents={hasAgents}
          hasBMHs={hasBMHs}
        />
      )}
      {editSSHKey && (
        <EditSSHKeyModal
          onClose={() => setEditSSHKey(false)}
          infraEnv={infraEnv}
          hasAgents={hasAgents}
          hasBMHs={hasBMHs}
        />
      )}
      {editNtpSources && (
        <EditNtpSourcesModal onClose={() => setEditNtpSources(false)} infraEnv={infraEnv} />
      )}
      {editProxy && (
        <EditProxyModal
          onClose={() => setEditProxy(false)}
          infraEnv={infraEnv}
          hasAgents={hasAgents}
          hasBMHs={hasBMHs}
        />
      )}
    </>
  );
};

export default EnvironmentDetails;
