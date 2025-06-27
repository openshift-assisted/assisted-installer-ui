import * as React from 'react';
import * as yaml from 'js-yaml';
import {
  Alert,
  AlertActionCloseButton,
  AlertVariant,
  Button,
  ButtonVariant,
  Form,
  FormGroup,
  Grid,
  GridItem,
  ModalBoxBody,
  ModalBoxFooter,
  Text,
  TextInputTypes,
  TextVariants,
} from '@patternfly/react-core';
import {
  Formik,
  FormikProps,
  FormikConfig,
  FieldArray,
  useField,
  useFormikContext,
  FormikErrors,
} from 'formik';
import * as Yup from 'yup';
import { TFunction } from 'i18next';

import {
  InputField,
  macAddressValidationSchema,
  CodeField,
  getFieldId,
  richNameValidationSchema,
  getRichTextValidation,
  RichInputField,
  BMCValidationMessages,
  bmcAddressValidationSchema,
} from '../../../common';
import { Language } from '@patternfly/react-code-editor';
import { MinusCircleIcon } from '@patternfly/react-icons/dist/js/icons/minus-circle-icon';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';
import {
  InfraEnvK8sResource,
  SecretK8sResource,
  NMStateK8sResource,
  BareMetalHostK8sResource,
} from '../../types';
import { AddBmcValues, BMCFormProps } from './types';
import {
  AGENT_BMH_NAME_LABEL_KEY,
  BMH_HOSTNAME_ANNOTATION,
  INFRAENV_AGENTINSTALL_LABEL_KEY,
} from '../common/constants';
import { getErrorMessage } from '../../../common/utils';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { getBareMetalHost, getBareMetalHostCredentialsSecret } from '../modals/utils';
import { k8sCreate, k8sPatch, Patch } from '@openshift-console/dynamic-plugin-sdk';
import { appendPatch } from '../../utils';
import { BMHModel, NMStateModel, SecretModel } from '../../types/models';

type MacMappingFieldProps = { macAddress: string; name: string }[];

const getFieldError = (errors: FormikErrors<MacMappingFieldProps>, fieldName: string): string => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
  return errors[fieldName]?.[0] || '';
};

const MacMapping = () => {
  const [field] = useField<MacMappingFieldProps>({
    name: 'macMapping',
  });
  const { errors } = useFormikContext<MacMappingFieldProps>();
  const fieldId = getFieldId('macMapping', 'input');
  const { t } = useTranslation();

  return (
    <FormGroup fieldId={fieldId} label={t('ai:MAC to interface name mapping')}>
      <FieldArray
        name="macMapping"
        render={({ push, remove }) => (
          <Grid hasGutter>
            <GridItem span={5}>
              <Text component={TextVariants.small}>MAC address</Text>
            </GridItem>
            <GridItem span={5}>
              <Text component={TextVariants.small}>NIC</Text>
            </GridItem>
            {field.value.map((mac, index) => {
              const macField = `macMapping[${index}].macAddress`;
              const nameField = `macMapping[${index}].name`;
              return (
                <React.Fragment key={index}>
                  <GridItem span={5}>
                    <InputField name={macField} inputError={getFieldError(errors, macField)} />
                  </GridItem>
                  <GridItem span={5}>
                    <InputField name={nameField} inputError={getFieldError(errors, nameField)} />
                  </GridItem>
                  {index !== 0 && (
                    <GridItem span={2}>
                      <MinusCircleIcon onClick={() => remove(index)} />
                    </GridItem>
                  )}
                </React.Fragment>
              );
            })}
            <GridItem span={6}>
              <Button
                icon={<PlusCircleIcon />}
                onClick={() => push({ macAddress: '', name: '' })}
                variant="link"
                isInline
              >
                {t('ai:Add more')}
              </Button>
            </GridItem>
          </Grid>
        )}
      />
    </FormGroup>
  );
};

const getNMState = (values: AddBmcValues, infraEnv: InfraEnvK8sResource): NMStateK8sResource => {
  const config = yaml.load(values.nmState);
  const nmState = {
    apiVersion: 'agent-install.openshift.io/v1beta1',
    kind: 'NMStateConfig',
    metadata: {
      generateName: `${infraEnv.metadata?.name || ''}-`,
      namespace: infraEnv.metadata?.namespace,
      labels: {
        [AGENT_BMH_NAME_LABEL_KEY]: values.name,
        [INFRAENV_AGENTINSTALL_LABEL_KEY]: infraEnv?.metadata?.name || '',
      },
    },
    spec: {
      config,
      interfaces: values.macMapping.filter((m) => m.macAddress.length && m.name.length),
    },
  };
  return nmState;
};

const getValidationSchema = (usedHostnames: string[], origHostname: string, t: TFunction) => {
  return Yup.object({
    name: Yup.string().required(t('ai:Required field')),
    hostname: richNameValidationSchema(t, usedHostnames, origHostname),
    bmcAddress: bmcAddressValidationSchema(t),
    username: Yup.string().required(t('ai:Required field')),
    password: Yup.string().required(t('ai:Required field')),
    bootMACAddress: macAddressValidationSchema,
    nmState: Yup.string(),
    macMapping: Yup.array().of(
      Yup.object().shape(
        {
          macAddress: macAddressValidationSchema.when('name', {
            is: (name: string) => !!name,
            then: () => macAddressValidationSchema.required(t('ai:MAC has to be specified')),
          }),
          name: Yup.string().when('macAddress', {
            is: (name: string) => !!name,
            then: () => Yup.string().required(t('ai:Name has to be specified')),
          }),
        },
        [['name', 'macAddress']],
      ),
    ),
  });
};

const emptyValues: AddBmcValues = {
  name: '',
  hostname: '',
  bmcAddress: '',
  username: '',
  password: '',
  bootMACAddress: '',
  disableCertificateVerification: true, // TODO(mlibra)
  online: true,
  nmState: `interfaces:
  - name: <nic1_name>
    type: ethernet
    state: up
    ipv4:
      address:
      - ip: <ip_address>
        prefix-length: 24
      enabled: true
dns-resolver:
  config:
    server:
    - <dns_ip_address>
routes:
  config:
  - destination: 0.0.0.0/0
    next-hop-address: <next_hop_ip_address>
    next-hop-interface: <next_hop_nic1_name>
  `,
  macMapping: [{ macAddress: '', name: '' }],
};

const getInitValues = (
  bmh?: BareMetalHostK8sResource,
  nmState?: NMStateK8sResource,
  secret?: SecretK8sResource,
  isEdit?: boolean,
  addNMState?: boolean,
): AddBmcValues => {
  let values = emptyValues;

  if (isEdit) {
    values = {
      name: bmh?.metadata?.name || '',
      hostname: bmh?.metadata?.annotations?.[BMH_HOSTNAME_ANNOTATION] || '',
      bmcAddress: bmh?.spec?.bmc?.address || '',
      username: secret?.data?.username ? atob(secret.data.username) : '',
      password: secret?.data?.password ? atob(secret.data.password) : '',
      bootMACAddress: bmh?.spec?.bootMACAddress || '',
      disableCertificateVerification: !!bmh?.spec?.bmc?.disableCertificateVerification,
      online: !!bmh?.spec?.online,
      nmState: nmState ? yaml.dump(nmState?.spec?.config) : emptyValues.nmState,
      macMapping: nmState?.spec?.interfaces || [{ macAddress: '', name: '' }],
    };
  }

  if (!addNMState) {
    values.nmState = '';
  }
  return values;
};

const onCreateBMH = async ({
  values,
  infraEnv,
  nmState,
  secret,
  bmh,
}: {
  values: AddBmcValues;
  infraEnv: InfraEnvK8sResource;
  nmState?: NMStateK8sResource;
  secret?: SecretK8sResource;
  bmh?: BareMetalHostK8sResource;
}) => {
  let newSecret: SecretK8sResource | undefined = undefined;
  if (secret) {
    const patches: Patch[] = [];
    appendPatch(patches, '/data/username', btoa(values.username), secret.data?.username);
    appendPatch(patches, '/data/password', btoa(values.password), secret.data?.password);
    if (patches.length) {
      await k8sPatch({
        model: SecretModel,
        resource: secret,
        data: patches,
      });
    }
  } else {
    const secret = getBareMetalHostCredentialsSecret(values, infraEnv?.metadata?.namespace || '');
    newSecret = await k8sCreate<SecretK8sResource>({
      model: SecretModel,
      data: secret,
    });
  }

  const formNMState = values.nmState ? getNMState(values, infraEnv) : undefined;
  if (nmState) {
    const patches: Patch[] = [];
    appendPatch(patches, '/spec/config', formNMState?.spec?.config, nmState.spec?.config);
    appendPatch(
      patches,
      '/spec/interfaces',
      formNMState?.spec?.interfaces || [],
      nmState.spec?.interfaces,
    );
    if (patches.length) {
      await k8sPatch({
        model: NMStateModel,
        resource: nmState,
        data: patches,
      });
    }
  } else if (formNMState) {
    await k8sCreate({
      model: NMStateModel,
      data: formNMState,
    });
  }

  if (bmh) {
    const patches: Patch[] = [];
    appendPatch(
      patches,
      `/metadata/annotations/${BMH_HOSTNAME_ANNOTATION.replace('/', '~1')}`,
      values.hostname,
      bmh.metadata?.annotations?.[BMH_HOSTNAME_ANNOTATION],
    );
    appendPatch(patches, '/spec/bmc/address', values.bmcAddress, bmh.spec?.bmc?.address);
    appendPatch(
      patches,
      '/spec/bmc/disableCertificateVerification',
      values.disableCertificateVerification,
      bmh.spec?.bmc?.disableCertificateVerification,
    );
    appendPatch(patches, '/spec/bootMACAddress', values.bootMACAddress, bmh.spec?.bootMACAddress);
    appendPatch(patches, '/spec/online', values.online, bmh.spec?.online);

    if (newSecret) {
      appendPatch(
        patches,
        '/spec/bmc/credentialsName',
        newSecret.metadata?.name,
        bmh.spec?.bmc?.credentialsName,
      );
    }
    if (patches.length) {
      await k8sPatch({
        model: BMHModel,
        resource: bmh,
        data: patches,
      });
    }
  } else if (newSecret) {
    const bmh = getBareMetalHost(values, infraEnv, newSecret);
    await k8sCreate({
      model: BMHModel,
      data: bmh,
    });
  }
};

const BMCForm: React.FC<BMCFormProps> = ({
  onClose,
  hasDHCP,
  infraEnv,
  bmh,
  nmState,
  secret,
  isEdit,
  usedHostnames,
}) => {
  const [error, setError] = React.useState<string>();

  const handleSubmit: FormikConfig<AddBmcValues>['onSubmit'] = async (values) => {
    try {
      setError(undefined);
      const nmState = values.nmState ? getNMState(values, infraEnv) : undefined;
      await onCreateBMH({
        values,
        infraEnv,
        nmState,
        secret,
        bmh,
      });
      onClose();
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  const { t } = useTranslation();
  const { initValues, validationSchema } = React.useMemo(() => {
    const addNmState =
      infraEnv.metadata?.labels && infraEnv.metadata?.labels['networkType'] === 'static';

    const initValues = getInitValues(bmh, nmState, secret, isEdit, addNmState);
    const validationSchema = getValidationSchema(usedHostnames, initValues.hostname, t);
    return { initValues, validationSchema };
  }, [infraEnv.metadata?.labels, usedHostnames, bmh, nmState, secret, isEdit, t]);

  return (
    <Formik
      initialValues={initValues}
      isInitialValid={false}
      validate={getRichTextValidation(validationSchema)}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, isValid, submitForm }: FormikProps<AddBmcValues>) => (
        <>
          <ModalBoxBody>
            <Form id="add-bmc-form">
              <InputField
                label={t('ai:Name')}
                name="name"
                placeholder={t('ai:Enter the name for the Host')}
                isRequired
                isDisabled={isEdit}
              />
              <RichInputField
                label={t('ai:Hostname')}
                name="hostname"
                placeholder={t('ai:Enter the hostname for the Host')}
                richValidationMessages={BMCValidationMessages(t)}
                isRequired
              />
              <InputField
                label={t('ai:Baseboard Management Controller Address')}
                name="bmcAddress"
                placeholder={t('ai:Enter an address')}
                isRequired
              />
              <InputField
                label={t('ai:Boot NIC MAC Address')}
                name="bootMACAddress"
                placeholder={t('ai:Enter an address')}
                description={t(
                  "ai:The MAC address of the host's network connected NIC that will be used to provision the host.",
                )}
                isRequired
              />
              <InputField
                label={t('ai:Username')}
                name="username"
                placeholder={t('ai:Enter a username for the BMC')}
                isRequired
              />
              <InputField
                type={TextInputTypes.password}
                label={t('ai:Password')}
                name="password"
                placeholder={t('ai:Enter a password for the BMC')}
                isRequired
              />
              {!hasDHCP && (
                <>
                  <CodeField
                    label={t('ai:NMState')}
                    name="nmState"
                    language={Language.yaml}
                    description={t(
                      'ai:Upload a YAML file in NMstate format (not the entire NMstate config CR) that includes your network configuration (static IPs, bonds, etc.).',
                    )}
                  />
                  <MacMapping />
                </>
              )}
            </Form>
            {error && (
              <Alert
                title={t('ai:Failed to add host')}
                variant={AlertVariant.danger}
                isInline
                actionClose={<AlertActionCloseButton onClose={() => setError(undefined)} />}
              >
                {error}
              </Alert>
            )}
          </ModalBoxBody>
          <ModalBoxFooter>
            <Button onClick={() => void submitForm()} isDisabled={isSubmitting || !isValid}>
              {isEdit ? t('ai:Submit') : t('ai:Create')}
            </Button>
            <Button onClick={onClose} variant={ButtonVariant.secondary}>
              {t('ai:Cancel')}
            </Button>
          </ModalBoxFooter>
        </>
      )}
    </Formik>
  );
};

export default BMCForm;
