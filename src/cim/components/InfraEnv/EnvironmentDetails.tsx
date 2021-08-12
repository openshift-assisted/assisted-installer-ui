import * as React from 'react';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Grid,
  GridItem,
  Title,
  TitleSizes,
} from '@patternfly/react-core';
import { CheckCircleIcon, CrossIcon } from '@patternfly/react-icons';
import { global_palette_green_500 as okColor } from '@patternfly/react-tokens/dist/js/global_palette_green_500';
import { global_warning_color_100 as warningColor } from '@patternfly/react-tokens/dist/js/global_warning_color_100';

import { LabelValue } from '../../../common';
import { InfraEnvK8sResource } from '../../types';

type EnvironmentDetailsProps = {
  infraEnv: InfraEnvK8sResource;
};

const EnvironmentDetails: React.FC<EnvironmentDetailsProps> = ({ infraEnv }) => {
  return (
    <Grid hasGutter>
      <GridItem span={12}>
        <Title headingLevel="h1" size={TitleSizes.lg}>
          Environment details
        </Title>
      </GridItem>
      <GridItem span={6}>
        <DescriptionList>
          <DescriptionListGroup>
            <DescriptionListTerm>Infrastructure Environment name</DescriptionListTerm>
            <DescriptionListDescription>{infraEnv.metadata?.name}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Location</DescriptionListTerm>
            <DescriptionListDescription>
              {infraEnv.metadata?.labels?.['assisted-install-location'] ?? 'No location'}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Labels</DescriptionListTerm>
            <DescriptionListDescription>
              {Object.keys(infraEnv.metadata?.labels || {}).map((k) => (
                <LabelValue key={k} value={`${k}=${infraEnv.metadata?.labels?.[k]}`} />
              ))}
            </DescriptionListDescription>
          </DescriptionListGroup>
          {infraEnv.metadata?.creationTimestamp && (
            <DescriptionListGroup>
              <DescriptionListTerm>Created at</DescriptionListTerm>
              <DescriptionListDescription>
                {new Date(infraEnv.metadata.creationTimestamp).toString()}
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}
        </DescriptionList>
      </GridItem>
      <GridItem span={6}>
        <DescriptionList>
          {infraEnv.spec?.proxy && (
            <>
              <DescriptionListGroup>
                <DescriptionListTerm>HTTP Proxy URL</DescriptionListTerm>
                <DescriptionListDescription>
                  {infraEnv.spec.proxy.httpProxy}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>HTTPS Proxy URL</DescriptionListTerm>
                <DescriptionListDescription>
                  {infraEnv.spec.proxy.httpsProxy}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>No proxy domains</DescriptionListTerm>
                <DescriptionListDescription>
                  {infraEnv.spec.proxy.noProxy}
                </DescriptionListDescription>
              </DescriptionListGroup>
            </>
          )}
          <DescriptionListGroup>
            <DescriptionListTerm>Secret and keys</DescriptionListTerm>
            <DescriptionListDescription>
              <>
                <div>
                  {infraEnv.spec?.pullSecretRef ? (
                    <CheckCircleIcon color={okColor.value} />
                  ) : (
                    <CrossIcon color={warningColor.value} />
                  )}
                  &nbsp;Pull Secret
                </div>
                <div>
                  {infraEnv.spec?.sshAuthorizedKey ? (
                    <CheckCircleIcon color={okColor.value} />
                  ) : (
                    <CrossIcon color={warningColor.value} />
                  )}
                  &nbsp;Public SSH Key
                </div>
              </>
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </GridItem>
    </Grid>
  );
};

export default EnvironmentDetails;
