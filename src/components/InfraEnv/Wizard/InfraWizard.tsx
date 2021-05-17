import * as Yup from 'yup';
import * as React from 'react';
import {
  Alert,
  AlertActionCloseButton,
  AlertVariant,
  Button,
  Wizard,
  WizardContextConsumer,
  WizardFooter,
} from '@patternfly/react-core';
import { Formik, useFormikContext } from 'formik';
import EnvironmentStep from './steps/EnvironmentStep';
import ReviewStep from './steps/ReviewStep';
import {
  httpProxyValidationSchema,
  noProxyValidationSchema,
  sshPublicKeyValidationSchema,
} from '../../ui/formik/validationSchemas';
import { EnvironmentStepFormValues } from './types';
import { getNMStateTemplate } from './utils';

const validationSchema = (usedNames: string[]) =>
  Yup.lazy<EnvironmentStepFormValues>((values) =>
    Yup.object<EnvironmentStepFormValues>().shape({
      name: Yup.string()
        .required()
        .test(
          'duplicate-name',
          'Infrastructure environment with the same name already exists!',
          (value: string) => !usedNames.find((n) => n === value),
        ),
      location: Yup.string().required(),
      baseDomain: Yup.string().required(),
      pullSecret: Yup.string().required(),
      sshPublicKey: sshPublicKeyValidationSchema.required(
        'An SSH key is required to debug hosts as they register.',
      ),
      httpProxy: httpProxyValidationSchema(values, 'httpsProxy'),
      httpsProxy: httpProxyValidationSchema(values, 'httpProxy'), // share the schema, httpS is currently not supported
      noProxy: noProxyValidationSchema,
      labels: Yup.array()
        .of(Yup.string())
        .required()
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
  baseDomain: '',
  pullSecret: '',
  sshPublicKey: '',
  httpProxy: '',
  httpsProxy: '',
  noProxy: '',
  enableProxy: false,
  labels: [],
  networks: [
    {
      config: getNMStateTemplate(''),
      mac: '',
    },
  ],
};

type FooterProps = {
  // eslint-disable-next-line
  error: any;
  cleanError: VoidFunction;
  created: boolean;
  onFinish: (values: EnvironmentStepFormValues) => void;
};

const Footer: React.FC<FooterProps> = ({ error, cleanError, created, onFinish }) => {
  const { submitForm, isSubmitting, isValid, values } = useFormikContext<
    EnvironmentStepFormValues
  >();
  return (
    <>
      {error && (
        <Alert
          className="kv-create-vm__error"
          variant={AlertVariant.danger}
          actionClose={<AlertActionCloseButton onClose={cleanError} />}
          title="Error creating InfraEnv"
        >
          {error}
        </Alert>
      )}
      <WizardFooter>
        <WizardContextConsumer>
          {({ onNext, onBack, onClose, activeStep }) => (
            <>
              <Button
                variant="primary"
                type="submit"
                onClick={
                  activeStep.id === 'create'
                    ? created
                      ? () => onFinish(values)
                      : submitForm
                    : onNext
                }
                isDisabled={!isValid || (activeStep.id === 'create' && isSubmitting)}
              >
                {activeStep.id === 'create' ? (created ? 'View InfraEnv' : 'Create') : 'Next'}
              </Button>
              <Button
                variant="secondary"
                onClick={onBack}
                isDisabled={activeStep.id === 'env' || created}
              >
                Back
              </Button>
              <Button variant="link" onClick={onClose} isDisabled={created}>
                Cancel
              </Button>
            </>
          )}
        </WizardContextConsumer>
      </WizardFooter>
    </>
  );
};

type InfraWizardProps = {
  // eslint-disable-next-line
  onSubmit: (values: EnvironmentStepFormValues) => Promise<any>;
  onFinish: (values: EnvironmentStepFormValues) => void;
  onClose: VoidFunction;
  usedNames: string[];
};

const InfraWizard: React.FC<InfraWizardProps> = ({ onSubmit, onFinish, onClose, usedNames }) => {
  const [created, setCreated] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | undefined>();
  const steps = [
    {
      id: 'env',
      name: 'Configure environment',
      component: <EnvironmentStep />,
    },
    {
      id: 'create',
      name: 'Review and create',
      component: <ReviewStep created={created} error={error} />,
    },
  ];
  return (
    <Formik
      initialValues={initialValues}
      initialStatus={{ error: null }}
      validationSchema={validationSchema(usedNames)}
      onSubmit={async (values) => {
        try {
          await onSubmit(values);
          setCreated(true);
        } catch (e) {
          setCreated(false);
          setError(e?.message ?? 'An error occured');
        }
      }}
    >
      <Wizard
        navAriaLabel="New infrastructure environment steps"
        mainAriaLabel="New infrastructure environment content"
        steps={steps}
        onClose={onClose}
        footer={
          <Footer
            error={error}
            cleanError={() => setError(undefined)}
            created={created}
            onFinish={onFinish}
          />
        }
      />
    </Formik>
  );
};

export default InfraWizard;
