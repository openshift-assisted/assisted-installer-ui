import * as React from 'react';
import { Trans } from 'react-i18next';
import {
  Flex,
  FlexItem,
  Form,
  FormGroup,
  Icon,
  InputGroup,
  InputGroupItem,
  InputGroupText,
  Content,
  ContentVariants,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';
import { HelpIcon } from '@patternfly/react-icons/dist/js/icons/help-icon';

import { useTranslation } from '@openshift-assisted/common/hooks/use-translation-wrapper';
import { CheckboxField, InputField, PopoverIcon } from '@openshift-assisted/common';
import { CimConfigurationFormFieldsProps, CimConfigurationValues } from './types';
import { useFormikContext } from 'formik';
import { isIngressController } from './persist';

export const CimConfigurationFormFields = ({
  platform,
  docConfigUrl,
  docConfigAwsUrl,
  isEdit,
  isInProgressPeriod,
  configureLoadBalancerInitial,
  setConfigureLoadBalancerInitial,
}: CimConfigurationFormFieldsProps) => {
  const { t } = useTranslation();
  const { setFieldValue, values } = useFormikContext<CimConfigurationValues>();

  React.useEffect(
    () => {
      const doItAsync = async (): Promise<void> => {
        if (platform === 'AWS') {
          if (!isEdit || (await isIngressController())) {
            setFieldValue('configureLoadBalancer', true);
            setConfigureLoadBalancerInitial(true);
            return;
          }
        }

        setFieldValue('configureLoadBalancer', false);
        setConfigureLoadBalancerInitial(false);
      };

      void doItAsync();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [platform],
  );

  return (
    <Form>
      <Content>
        <Content component={ContentVariants.h4} className="pf-v5-u-font-weight-bold">
          {t('ai:Storage sizes')}{' '}
          <PopoverIcon
            bodyContent={t(
              'ai:The storage sizes will be used to store different files and data for cluster creation.',
            )}
            footerContent={
              <a href={docConfigUrl} target="_blank" rel="noreferrer">
                <Trans t={t}>
                  ai:Learn more about storage sizes. <ExternalLinkAltIcon />
                </Trans>
              </a>
            }
            aria-label={t('ai:More info for configure storage sizes')}
            noVerticalAlign
          >
            <Icon>
              <HelpIcon />
            </Icon>
          </PopoverIcon>
        </Content>
        <Content>
          {t('ai:If there are many clusters, use higher values for the storage fields.')}
        </Content>
      </Content>

      <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
        <FlexItem>
          <FormGroup
            label={t('ai:Database storage')}
            labelHelp={
              <PopoverIcon
                noVerticalAlign
                bodyContent={t(
                  'ai:Specify how much storage is allocated for storing files such as database tables and database views for the clusters. Recommended is 10Gi or more. The value can not be updated later.',
                )}
                aria-label={t('ai:More info for database storage')}
              >
                <Icon>
                  <HelpIcon />
                </Icon>
              </PopoverIcon>
            }
            isRequired
          >
            <InputGroup>
              <InputGroupItem isFill>
                <InputField
                  type="number"
                  name="dbVolSize"
                  isRequired
                  isDisabled={isEdit}
                  min={0}
                  style={{ maxWidth: 'initial' }}
                />
              </InputGroupItem>
              <InputGroupText isPlain>Gi</InputGroupText>
            </InputGroup>
          </FormGroup>
        </FlexItem>

        <FlexItem>
          <FormGroup
            label={t('ai:System storage')}
            labelHelp={
              <PopoverIcon
                noVerticalAlign
                bodyContent={t(
                  'ai:Specify how much storage is allocated for storing logs, manifests and "kubeconfig" files for the clusters. Recommended is 100Gi or more. The value can not be updated later.',
                )}
                aria-label={t('ai:More info for system storage')}
              >
                <Icon>
                  <HelpIcon />
                </Icon>
              </PopoverIcon>
            }
            isRequired
          >
            <InputGroup>
              <InputGroupItem isFill>
                <InputField
                  isRequired
                  isDisabled={isEdit}
                  type="number"
                  name="fsVolSize"
                  min={0}
                  style={{ maxWidth: 'initial' }}
                />
              </InputGroupItem>
              <InputGroupText isPlain>Gi</InputGroupText>
            </InputGroup>
          </FormGroup>
        </FlexItem>

        <FlexItem>
          <FormGroup
            label={t('ai:Image storage')}
            labelHelp={
              <PopoverIcon
                noVerticalAlign
                bodyContent={t(
                  'ai:Specify how much storage to allocate for the images of the clusters. There must be 1G of image storage for each instance of Red Hat Enterprise Linux CoreOS that is running. Recommended is 50Gi or more. The value can not be updated later.',
                )}
                aria-label={t('ai:More info for image storage')}
              >
                <Icon>
                  <HelpIcon />
                </Icon>
              </PopoverIcon>
            }
            isRequired
          >
            <InputGroup>
              <InputGroupItem isFill>
                <InputField
                  isRequired
                  isDisabled={isEdit /* Not supported by backend */}
                  type="number"
                  name="imgVolSize"
                  style={{ maxWidth: 'initial' }}
                  min={0}
                />
              </InputGroupItem>
              <InputGroupText isPlain>Gi</InputGroupText>
            </InputGroup>
          </FormGroup>
        </FlexItem>
      </Flex>

      <Stack>
        <StackItem>
          <CheckboxField
            name="configureLoadBalancer"
            label={
              <>
                {t('ai:Configure load balancer on Amazon Web Services for me.')}{' '}
                <PopoverIcon
                  noVerticalAlign
                  bodyContent={t(
                    "ai:If you're running your hub cluster of Amazon Web Services and want to enable the CIM service, we recommend you to configure your load balancer if it is not already configured. Learn more about enabling CIM on AWS.",
                  )}
                  footerContent={
                    <a href={docConfigAwsUrl} target="_blank" rel="noreferrer">
                      <Trans t={t}>
                        ai:Learn more about enabling CIM on AWS <ExternalLinkAltIcon />
                      </Trans>
                    </a>
                  }
                  aria-label={t('ai:More info for load balancer on Amazon web services')}
                >
                  <Icon>
                    <HelpIcon />
                  </Icon>
                </PopoverIcon>
              </>
            }
            isDisabled={isInProgressPeriod || (isEdit && configureLoadBalancerInitial)}
          />
        </StackItem>

        <StackItem>
          <CheckboxField
            name={'addCiscoIntersightURL'}
            label={
              <>
                {t('ai:Configure custom URL for Cisco Intersight')}{' '}
                <PopoverIcon
                  noVerticalAlign
                  bodyContent={t(
                    'ai:Configure a custom URL to add hosts from Cisco Intersight on disconnected environments.',
                  )}
                >
                  <Icon>
                    <HelpIcon />
                  </Icon>
                </PopoverIcon>
              </>
            }
            onChange={(checked) => {
              if (!checked) {
                setFieldValue('ciscoIntersightURL', '', false);
              }
            }}
          />

          {values.addCiscoIntersightURL && (
            <InputField
              name={'ciscoIntersightURL'}
              label={t('ai:Cisco Intersight URL')}
              isRequired
              placeholder="https://www.intersight.com/an/workflow/workflow-definitions/execute/AddServersFromISO"
              helperText={t('ai:Provide the complete URL, including the protocol and parameters.')}
            />
          )}
        </StackItem>
      </Stack>
    </Form>
  );
};
