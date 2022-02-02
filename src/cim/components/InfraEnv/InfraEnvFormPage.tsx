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
  InputField,
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
  NAME_VALIDATION_MESSAGES,
  RichInputField,
} from '../../../common';

import './infra-env.css';

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
  enableNtpSources: boolean;
  additionalNtpSources: string;
};

const validationSchema = (usedNames: string[]) =>
  Yup.lazy<EnvironmentStepFormValues>((values) =>
    Yup.object<EnvironmentStepFormValues>().shape({
      name: richNameValidationSchema(usedNames),
      location: Yup.string().required('Location is a required field.'),
      pullSecret: pullSecretValidationSchema.required('Pull secret is a required field.'),
      sshPublicKey: sshPublicKeyValidationSchema.required(
        'An SSH key is required to debug hosts as they register.',
      ),
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
  enableNtpSources: false,
  additionalNtpSources: '',
};

type InfraEnvFormProps = {
  onValuesChanged?: (values: EnvironmentStepFormValues) => void;
};

const InfraEnvForm: React.FC<InfraEnvFormProps> = ({ onValuesChanged }) => {
  const { values } = useFormikContext<EnvironmentStepFormValues>();
  React.useEffect(() => onValuesChanged?.(values), [onValuesChanged, values]);
  return (
    <Stack hasGutter>
      <StackItem>
        Infrastructure environments are used by clusters. Create an infrastructure environment to
        add resources to your cluster.
      </StackItem>
      <StackItem>
        <Form>
          <RichInputField
            label="Name"
            name="name"
            isRequired
            richValidationMessages={NAME_VALIDATION_MESSAGES}
            placeholder="Enter infrastructure environment name"
          />
          <FormGroup
            fieldId="network-type"
            label="Network type"
            labelIcon={
              <PopoverIcon
                noVerticalAlign
                bodyContent={
                  <>
                    This will determine for the infrastructure environment which kind of hosts would
                    be able to be added. If the hosts that you want to add are using DHCP server,
                    select this option, else, select the static IP.
                  </>
                }
              />
            }
          >
            <Flex justifyContent={{ default: 'justifyContentFlexStart' }}>
              <FlexItem>
                <RadioField
                  name="networkType"
                  id="dhcp"
                  value="dhcp"
                  label="I use only DHCP server"
                />
              </FlexItem>
              <FlexItem spacer={{ default: 'spacer4xl' }} />
              <FlexItem>
                <RadioField
                  name="networkType"
                  id="static-ip"
                  value="static"
                  label={
                    <>
                      Some or all of my hosts use static network configuration&nbsp;
                      <PopoverIcon
                        noVerticalAlign
                        bodyContent={
                          <Stack hasGutter>
                            <StackItem>
                              To use static network configuration, follow the steps listed in the
                              documentation.
                            </StackItem>
                            <StackItem>
                              <Button
                                variant="link"
                                icon={<ExternalLinkAltIcon />}
                                iconPosition="right"
                                isInline
                                onClick={() => window.open(OCP_STATIC_IP_DOC, '_blank', 'noopener')}
                              >
                                View documentation
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
          <InputField
            label="Location"
            name="location"
            placeholder="Enter geographic location for the environment"
            helperText="Used to describe hosts' physical location. Helps for quicker host selection during cluster creation."
            isRequired
          />
          <LabelField label="Labels" name="labels" />
          <PullSecretField isOcm={false} />
          <UploadSSH />
          <ProxyFields />
          <CheckboxField
            label="Add your own NTP (Network Time Protocol) sources"
            name="enableNtpSources"
            helperText={
              <p>
                Configure your own NTP sources to synchronize the time between the hosts that will
                be added to this infrastructure environment.
              </p>
            }
          />
          {values.enableNtpSources && (
            <AdditionalNTPSourcesField
              name="additionalNtpSources"
              helperText="A comma separated list of IP or domain names of the NTP pools or servers."
            />
          )}
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
};

export const InfraEnvFormPage: React.FC<InfraEnvFormPageProps> = ({
  usedNames,
  onSubmit,
  onClose,
  onFinish,
  onValuesChanged,
}) => {
  const [error, setError] = React.useState<string | undefined>();
  return (
    <Formik
      initialValues={initialValues}
      initialStatus={{ error: null }}
      validate={getRichTextValidation(validationSchema(usedNames))}
      onSubmit={async (values: EnvironmentStepFormValues) => {
        try {
          await onSubmit?.(values);
          onFinish?.(values);
        } catch (e) {
          setError(e?.message ?? 'An error occured');
        }
      }}
    >
      {({ isValid, isSubmitting, submitForm }: FormikProps<EnvironmentStepFormValues>) => (
        <Stack hasGutter>
          <StackItem>
            {onSubmit && onClose ? (
              <Grid hasGutter span={8}>
                <GridItem>
                  <Title headingLevel="h1" size={TitleSizes.xl}>
                    Configure environment
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
                title="Error creating InfraEnv"
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
                  Create {isSubmitting && <Spinner isSVG size="md" />}
                </Button>
                <Button variant="link" onClick={onClose} isDisabled={isSubmitting}>
                  Cancel
                </Button>
              </>
            </StackItem>
          )}
        </Stack>
      )}
    </Formik>
  );
};
