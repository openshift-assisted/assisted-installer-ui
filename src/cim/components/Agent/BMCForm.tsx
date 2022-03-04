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
import { Formik, FormikProps, FormikConfig, FieldArray, useField, useFormikContext } from 'formik';
import * as Yup from 'yup';
import { InfraEnvK8sResource, SecretK8sResource } from '../../types';
import {
  InputField,
  macAddressValidationSchema,
  CodeField,
  getFieldId,
  richNameValidationSchema,
  getRichTextValidation,
  RichInputField,
  HOSTNAME_VALIDATION_MESSAGES,
  bmcAddressValidationSchema,
} from '../../../common';
import { Language } from '@patternfly/react-code-editor';
import { MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { AddBmcValues, BMCFormProps } from './types';
import { NMStateK8sResource } from '../../types/k8s/nm-state';
import { BareMetalHostK8sResource } from '../../types/k8s/bare-metal-host';
import { AGENT_BMH_HOSTNAME_LABEL_KEY, BMH_HOSTNAME_ANNOTATION } from '../common';

const MacMapping = () => {
  const [field, { touched, error }] = useField<{ macAddress: string; name: string }[]>({
    name: 'macMapping',
  });
  const { errors } = useFormikContext();

  const fieldId = getFieldId('macMapping', 'input');
  const isValid = !(touched && error);
  return (
    <FormGroup
      fieldId={fieldId}
      label="Mac to interface name mapping"
      validated={isValid ? 'default' : 'error'}
    >
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
                    <InputField name={macField} inputError={errors[macField]?.[0]} />
                  </GridItem>
                  <GridItem span={5}>
                    <InputField name={nameField} inputError={errors[nameField]?.[0]} />
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
                Add more
              </Button>
            </GridItem>
          </Grid>
        )}
      />
    </FormGroup>
  );
};

const getNMState = (values: AddBmcValues, infraEnv: InfraEnvK8sResource): NMStateK8sResource => {
  // eslint-disable-next-line
  const config: any = yaml.load(values.nmState);
  const nmState = {
    apiVersion: 'agent-install.openshift.io/v1beta1',
    kind: 'NMStateConfig',
    metadata: {
      generateName: `${infraEnv.metadata?.name}-`,
      namespace: infraEnv.metadata?.namespace,
      labels: {
        [AGENT_BMH_HOSTNAME_LABEL_KEY]: values.hostname,
      },
    },
    spec: {
      config,
      interfaces: values.macMapping.filter((m) => m.macAddress.length && m.name.length),
    },
  };
  return nmState;
};

const getValidationSchema = (usedHostnames: string[], origHostname: string) =>
  Yup.object({
    name: Yup.string().required(),
    hostname: richNameValidationSchema(usedHostnames, origHostname),
    bmcAddress: bmcAddressValidationSchema.required(),
    username: Yup.string().required(),
    password: Yup.string().required(),
    bootMACAddress: macAddressValidationSchema,
    nmState: Yup.string(),
    macMapping: Yup.array().of(
      Yup.object().shape(
        {
          macAddress: macAddressValidationSchema.when(['name'], {
            is: (name) => !!name,
            then: macAddressValidationSchema.required('MAC has to be specified'),
          }),
          name: Yup.string().when(['macAddress'], {
            is: (macAddress) => !!macAddress,
            then: Yup.string().required('Name has to be specified'),
          }),
        },
        [['name', 'macAddress']],
      ),
    ),
  });

const emptyValues: AddBmcValues = {
  name: '',
  hostname: '',
  bmcAddress: '',
  username: '',
  password: '',
  bootMACAddress: '',
  disableCertificateVerification: true, // TODO(mlibra)
  online: false, // TODO(mlibra)
  nmState: '',
  macMapping: [{ macAddress: '', name: '' }],
};

const getInitValues = (
  bmh?: BareMetalHostK8sResource,
  nmState?: NMStateK8sResource,
  secret?: SecretK8sResource,
  isEdit?: boolean,
): AddBmcValues => {
  if (isEdit) {
    return {
      name: bmh?.metadata?.name || '',
      hostname: bmh?.metadata?.annotations?.[BMH_HOSTNAME_ANNOTATION] || '',
      bmcAddress: bmh?.spec?.bmc?.address || '',
      username: secret?.data?.username ? atob(secret.data.username) : '',
      password: secret?.data?.password ? atob(secret.data.password) : '',
      bootMACAddress: bmh?.spec?.bootMACAddress || '',
      disableCertificateVerification: !!bmh?.spec?.bmc?.disableCertificateVerification,
      online: !!bmh?.spec?.online,
      nmState: nmState ? yaml.dump(nmState?.spec?.config) : '',
      macMapping: nmState?.spec?.interfaces || [{ macAddress: '', name: '' }],
    };
  } else {
    return emptyValues;
  }
};

const BMCForm: React.FC<BMCFormProps> = ({
  onCreateBMH,
  onClose,
  hasDHCP,
  infraEnv,
  bmh,
  nmState,
  secret,
  isEdit,
  usedHostnames,
}) => {
  const [error, setError] = React.useState();

  const handleSubmit: FormikConfig<AddBmcValues>['onSubmit'] = async (values) => {
    try {
      setError(undefined);
      const nmState = values.nmState ? getNMState(values, infraEnv) : undefined;
      await onCreateBMH(values, nmState);
      onClose();
    } catch (e) {
      setError(e.message);
    }
  };

  const { initValues, validationSchema } = React.useMemo(() => {
    const initValues = getInitValues(bmh, nmState, secret, isEdit);
    const validationSchema = getValidationSchema(usedHostnames, initValues.hostname);
    return { initValues, validationSchema };
  }, [usedHostnames, bmh, nmState, secret, isEdit]);
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
                label="Name"
                name="name"
                placeholder="Enter the name for the Host"
                isRequired
                isDisabled={isEdit}
              />
              <RichInputField
                label="Hostname"
                name="hostname"
                placeholder="Enter the hostname for the Host"
                richValidationMessages={HOSTNAME_VALIDATION_MESSAGES}
                isRequired
              />
              <InputField
                label="Baseboard Management Controller Address"
                name="bmcAddress"
                placeholder="Enter an address"
                isRequired
              />
              <InputField
                label="Boot NIC MAC Address"
                name="bootMACAddress"
                placeholder="Enter an address"
                description="The MAC address of the host's network connected NIC that wll be used to provision the host."
              />
              <InputField
                label="Username"
                name="username"
                placeholder="Enter a username for the BMC"
                isRequired
              />
              <InputField
                type={TextInputTypes.password}
                label="Password"
                name="password"
                placeholder="Enter a password for the BMC"
                isRequired
              />
              {!hasDHCP && (
                <>
                  <CodeField
                    label="NMState"
                    name="nmState"
                    language={Language.yaml}
                    description="Upload a YAML file in NMstate format that includes your network configuration (static IPs, bonds, etc.)."
                  />
                  <MacMapping />
                </>
              )}
            </Form>
            {error && (
              <Alert
                title="Failed to add host"
                variant={AlertVariant.danger}
                isInline
                actionClose={<AlertActionCloseButton onClose={() => setError(undefined)} />}
              >
                {error}
              </Alert>
            )}
          </ModalBoxBody>
          <ModalBoxFooter>
            <Button onClick={submitForm} isDisabled={isSubmitting || !isValid}>
              {isEdit ? 'Submit' : 'Create'}
            </Button>
            <Button onClick={onClose} variant={ButtonVariant.secondary}>
              Cancel
            </Button>
          </ModalBoxFooter>
        </>
      )}
    </Formik>
  );
};

export default BMCForm;
