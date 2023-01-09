import * as React from 'react';
import * as Yup from 'yup';
import {
  Alert,
  AlertActionCloseButton,
  AlertVariant,
  Button,
  Flex,
  FlexItem,
  Form,
  FormGroup,
  Grid,
  GridItem,
  Spinner,
  Stack,
  StackItem,
  Title,
  TitleSizes,
} from '@patternfly/react-core';
import { Formik, FormikProps, useFormikContext } from 'formik';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import {
  httpProxyValidationSchema,
  noProxyValidationSchema,
  PullSecretField,
  sshPublicKeyValidationSchema,
  LabelField,
  UploadSSH,
  ProxyFields,
  RadioField,
  PopoverIcon,
  pullSecretValidationSchema,
  OCP_STATIC_IP_DOC,
  CheckboxField,
  AdditionalNTPSourcesField,
  richNameValidationSchema,
  getRichTextValidation,
  nameValidationMessages,
  RichInputField,
  locationValidationSchema,
  locationValidationMessages,
  ntpSourceValidationSchema,
  CpuArchitecture,
} from '../../../common';

import './infra-env.css';
import { getErrorMessage } from '../../../common/utils';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { TFunction } from 'i18next';

export type EnvironmentStepFormValues = {
  name: string;
  location: string;
  pullSecret: string;
  sshPublicKey: string;
  httpProxy: string;
  httpsProxy: string;
  noProxy: string;
  enableProxy: boolean;
  labels: string[];
  networkType: 'dhcp' | 'static';
  cpuArchitecture: CpuArchitecture;
  enableNtpSources: boolean;
  additionalNtpSources: string;
};

const validationSchema = (usedNames: string[], t: TFunction) =>
  Yup.lazy<EnvironmentStepFormValues>((values) =>
    Yup.object<EnvironmentStepFormValues>().shape({
      name: richNameValidationSchema(t, usedNames),
      location: locationValidationSchema(t).required(t('ai:Location is a required field.')),
      pullSecret: pullSecretValidationSchema.required(t('ai:Pull secret is a required field.')),
      sshPublicKey: sshPublicKeyValidationSchema,
      httpProxy: httpProxyValidationSchema(values, 'httpsProxy'),
      httpsProxy: httpProxyValidationSchema(values, 'httpProxy'), // share the schema, httpS is currently not supported
      noProxy: noProxyValidationSchema,
      labels: Yup.array()
        .of(Yup.string())
        .test(
          'label-equals-validation',
          'Label selector needs to be in a `key=value` form',
          (values: string[]) =>
            values.every((value) => {
              const parts = value.split('=');
              return parts.length === 2;
            }),
        ),
      additionalNtpSources: ntpSourceValidationSchema,
    }),
  );

const initialValues: EnvironmentStepFormValues = {
  name: '',
  location: '',
  pullSecret: '',
  sshPublicKey: '',
  httpProxy: '',
  httpsProxy: '',
  noProxy: '',
  enableProxy: false,
  labels: [],
  networkType: 'dhcp',
  cpuArchitecture: CpuArchitecture.x86,
  enableNtpSources: false,
  additionalNtpSources: '',
};

type InfraEnvFormProps = {
  onValuesChanged?: (values: EnvironmentStepFormValues) => void;
};

const InfraEnvForm: React.FC<InfraEnvFormProps> = ({ onValuesChanged }) => {
  const { values } = useFormikContext<EnvironmentStepFormValues>();
  const { t } = useTranslation();
  React.useEffect(() => onValuesChanged?.(values), [onValuesChanged, values]);
  return (
    <Stack hasGutter>
      <StackItem>
        {t(
          'ai:Infrastructure environments are used by clusters. Create an infrastructure environment to add resources to your cluster.',
        )}
      </StackItem>
      <StackItem>
        <Form>
          <RichInputField
            label={t('ai:Name')}
            name="name"
            isRequired
            richValidationMessages={nameValidationMessages(t)}
            placeholder={t('ai:Enter infrastructure environment name')}
          />
          <FormGroup
            fieldId="network-type"
            label={t('ai:Network type')}
            labelIcon={
              <PopoverIcon
                noVerticalAlign
                bodyContent={
                  <>
                    {t(
                      'ai:This will determine for the infrastructure environment which kind of hosts would be able to be added. If the hosts that you want to add are using DHCP server, select this option, else, select the static IP.',
                    )}
                  </>
                }
              />
            }
          >
            <Flex justifyContent={{ default: 'justifyContentFlexStart' }}>
              <FlexItem>
                <RadioField name="networkType" id="dhcp" value="dhcp" label={t('ai:DHCP only')} />
              </FlexItem>
              <FlexItem spacer={{ default: 'spacer4xl' }} />
              <FlexItem>
                <RadioField
                  name="networkType"
                  id="static-ip"
                  value="static"
                  label={
                    <>
                      {t('ai:Static IP, bridges and bonds')}&nbsp;
                      <PopoverIcon
                        noVerticalAlign
                        bodyContent={
                          <Stack hasGutter>
                            <StackItem>
                              {t(
                                'ai:To use static network configuration, follow the steps listed in the documentation.',
                              )}
                            </StackItem>
                            <StackItem>
                              <Button
                                variant="link"
                                icon={<ExternalLinkAltIcon />}
                                iconPosition="right"
                                isInline
                                onClick={() => window.open(OCP_STATIC_IP_DOC, '_blank', 'noopener')}
                              >
                                {t('ai:View documentation')}
                              </Button>
                            </StackItem>
                          </Stack>
                        }
                      />
                    </>
                  }
                />
              </FlexItem>
            </Flex>
          </FormGroup>
          <FormGroup fieldId="cpuArchitecture" label={t('ai:CPU architecture')}>
            <Flex justifyContent={{ default: 'justifyContentFlexStart' }}>
              <FlexItem>
                <RadioField
                  name="cpuArchitecture"
                  id="x86_64"
                  value="x86_64"
                  label={t('ai:x86_64')}
                />
              </FlexItem>
              <FlexItem spacer={{ default: 'spacer4xl' }} />
              <FlexItem>
                <RadioField
                  name="cpuArchitecture"
                  id="arm64"
                  value="arm64"
                  label={<>{t('ai:arm64')}&nbsp;</>}
                />
              </FlexItem>
            </Flex>
          </FormGroup>
          <RichInputField
            label={t('ai:Location')}
            name="location"
            isRequired
            richValidationMessages={locationValidationMessages(t)}
            placeholder={t('ai:Enter geographic location for the environment')}
            helperText={t(
              "ai:Used to describe hosts' physical location. Helps for quicker host selection during cluster creation.",
            )}
          />
          <LabelField label={t('ai:Labels')} name="labels" />
          <PullSecretField isOcm={false} />
          <UploadSSH />
          <ProxyFields />
          <CheckboxField
            label={t('ai:Add your own NTP (Network Time Protocol) sources')}
            name="enableNtpSources"
            helperText={
              <p>
                {t(
                  'ai:Configure your own NTP sources to synchronize the time between the hosts that will be added to this infrastructure environment.',
                )}
              </p>
            }
            body={
              values.enableNtpSources && (
                <Grid hasGutter>
                  <AdditionalNTPSourcesField
                    name="additionalNtpSources"
                    helperText={t(
                      'ai:A comma separated list of IP or domain names of the NTP pools or servers.',
                    )}
                  />
                </Grid>
              )
            }
          />
        </Form>
      </StackItem>
    </Stack>
  );
};

type InfraEnvFormPageProps = InfraEnvFormProps & {
  usedNames: string[];
  // eslint-disable-next-line
  onSubmit?: (values: EnvironmentStepFormValues) => Promise<any>;
  onFinish?: (values: EnvironmentStepFormValues) => void;
  onClose?: VoidFunction;
  formRef: React.Ref<FormikProps<EnvironmentStepFormValues>>;
};

export const InfraEnvFormPage: React.FC<InfraEnvFormPageProps> = ({
  usedNames,
  onSubmit,
  onClose,
  onFinish,
  onValuesChanged,
  formRef,
}) => {
  const [error, setError] = React.useState<string | undefined>();
  const { t } = useTranslation();
  return (
    <Formik
      initialValues={initialValues}
      initialStatus={{ error: null }}
      validate={getRichTextValidation(validationSchema(usedNames, t))}
      onSubmit={async (values: EnvironmentStepFormValues) => {
        try {
          await onSubmit?.(values);
          onFinish?.(values);
        } catch (e) {
          setError(getErrorMessage(e));
        }
      }}
      innerRef={formRef}
    >
      {({ isValid, isSubmitting, submitForm }: FormikProps<EnvironmentStepFormValues>) => (
        <Stack hasGutter>
          <StackItem>
            {onSubmit && onClose ? (
              <Grid hasGutter span={8}>
                <GridItem>
                  <Title headingLevel="h1" size={TitleSizes.xl}>
                    {t('ai:Configure environment')}
                  </Title>
                </GridItem>
                <GridItem>
                  <InfraEnvForm onValuesChanged={onValuesChanged} />
                </GridItem>
              </Grid>
            ) : (
              <div className="infra-env__form">
                <InfraEnvForm onValuesChanged={onValuesChanged} />
              </div>
            )}
          </StackItem>
          {error && (
            <StackItem>
              <Alert
                variant={AlertVariant.danger}
                actionClose={<AlertActionCloseButton onClose={() => setError(undefined)} />}
                title={t('ai:Error creating InfraEnv')}
              >
                {error}
              </Alert>
            </StackItem>
          )}
          {onSubmit && onClose && (
            <StackItem>
              <>
                <Button
                  variant="primary"
                  type="submit"
                  isDisabled={!isValid || isSubmitting}
                  onClick={submitForm}
                >
                  {t('ai:Create')} {isSubmitting && <Spinner isSVG size="md" />}
                </Button>
                <Button variant="link" onClick={onClose} isDisabled={isSubmitting}>
                  {t('ai:Cancel')}
                </Button>
              </>
            </StackItem>
          )}
        </Stack>
      )}
    </Formik>
  );
};
