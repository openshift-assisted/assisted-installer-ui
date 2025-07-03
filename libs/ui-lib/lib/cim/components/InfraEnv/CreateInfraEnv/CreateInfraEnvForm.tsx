import { useFormikContext } from 'formik';
import * as React from 'react';
import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';
import {
  Button,
  Flex,
  FlexItem,
  Form,
  FormGroup,
  Grid,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import {
  AdditionalNTPSourcesField,
  CheckboxField,
  getOCPStaticIPDocLink,
  LabelField,
  locationValidationMessages,
  nameValidationMessages,
  PopoverIcon,
  ProxyFields,
  PullSecretField,
  RadioField,
  RichInputField,
  UploadSSH,
} from '../../../../common';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';
import { DOC_VERSION } from '../../../config/constants';
import CpuArchitectureDropdown from '../../common/CpuArchitectureDropdown';
import CredentialsField from '../../formik/CredentialsField';
import { OsImage, SecretK8sResource } from '../../../types';
import { EnvironmentStepFormValues } from './utils';
import InfraEnvOpenShiftVersionDropdown from '../InfraEnvOpenShiftVersionDropdown';

type InfraEnvFormProps = {
  credentials: SecretK8sResource[];
  osImages: OsImage[];
};

const CreateInfraEnvForm: React.FC<InfraEnvFormProps> = ({ credentials, osImages }) => {
  const { values, setFieldValue } = useFormikContext<EnvironmentStepFormValues>();
  const { t } = useTranslation();

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
                                onClick={() =>
                                  window.open(
                                    getOCPStaticIPDocLink(DOC_VERSION),
                                    '_blank',
                                    'noopener',
                                  )
                                }
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
          <CpuArchitectureDropdown />
          {!!osImages && <InfraEnvOpenShiftVersionDropdown osImages={osImages} />}
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
          <CredentialsField
            name="credentials"
            onSelect={(cred) => {
              setFieldValue(
                'pullSecret',
                cred.data?.['pullSecret'] ? atob(cred.data['pullSecret']) : '',
              );
              setFieldValue(
                'sshPublicKey',
                cred.data?.['ssh-publickey'] ? atob(cred.data['ssh-publickey']) : '',
              );
            }}
            credentials={credentials}
          />
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

export default CreateInfraEnvForm;
