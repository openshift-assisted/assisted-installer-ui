import React from 'react';
import {
  ButtonVariant,
  Button,
  Form,
  Alert,
  AlertVariant,
  AlertActionCloseButton,
  Modal,
  ModalBoxBody,
  ModalBoxFooter,
  ModalVariant,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { History } from 'history';
import { uniqueNamesGenerator, Config, adjectives, colors, animals } from 'unique-names-generator';
import * as Yup from 'yup';
import { LoadingState } from '../ui/uiState';
import { postCluster, getClusters } from '../../api/clusters';
import { Formik, FormikHelpers } from 'formik';
import {
  CLUSTER_MANAGER_SITE_LINK,
  OPENSHIFT_VERSION_OPTIONS,
  routeBasePath,
} from '../../config/constants';
import { ClusterCreateParams } from '../../api/types';
import { InputField, SelectField, TextAreaField } from '../ui/formik';
import GridGap from '../ui/GridGap';
import { handleApiError, getErrorMessage } from '../../api/utils';
import { ToolbarButton } from '../ui/Toolbar';
import { nameValidationSchema, validJSONSchema } from '../ui/formik/validationSchemas';
import { ocmClient } from '../../api';

const namesConfig: Config = {
  dictionaries: [adjectives, colors, animals],
  // dictionaries: [starWars],
  separator: '-',
  length: 3,
  style: 'lowerCase',
};

const pullSecretHelperText = (
  <>
    The pull secret can be obtained from the Pull Secret page on the{' '}
    {
      <a href={CLUSTER_MANAGER_SITE_LINK} target="_blank" rel="noopener noreferrer">
        Red Hat OpenShift Cluster Manager site <ExternalLinkAltIcon />
      </a>
    }
    .
  </>
);

type NewClusterModalButtonProps = {
  ButtonComponent?: typeof Button | typeof ToolbarButton;
  onClick: () => void;
};

export const NewClusterModalButton: React.FC<NewClusterModalButtonProps> = ({
  ButtonComponent = Button,
  onClick,
}) => (
  <ButtonComponent variant={ButtonVariant.primary} onClick={onClick} id="button-create-new-cluster">
    Create New Cluster
  </ButtonComponent>
);

type NewClusterModalProps = {
  closeModal: () => void;
  history: History;
};

export const NewClusterModal: React.FC<NewClusterModalProps> = ({ closeModal, history }) => {
  const nameInputRef = React.useCallback((node) => {
    if (node !== null) {
      node.focus();
    }
  }, []);
  const [uniqueGeneratedName] = React.useState(() => uniqueNamesGenerator(namesConfig)); // never changed
  const [initialPullSecret, setInitialPullSecret] = React.useState('');
  const [initialError, setInitialError] = React.useState<{ title: string }>();

  const validationSchema = React.useCallback(
    () =>
      Yup.object({
        name: nameValidationSchema,
        openshiftVersion: Yup.string().required('Required'),
        pullSecret: validJSONSchema.required('Pull secret must be provided.'),
      }),
    [],
  );

  React.useEffect(() => {
    const getPullSecret = async () => {
      if (ocmClient) {
        try {
          const response = await ocmClient.post('/api/accounts_mgmt/v1/access_token');
          setInitialPullSecret(response?.request?.response || ''); // unmarshalled response as a string
        } catch (e) {
          console.warn('Failed to receive pull_secret, error: ', e);
          setInitialError({ title: 'Failed to receive pull secret' });
        }
      }
    };
    getPullSecret();
  }, []);

  const handleSubmit = async (
    values: ClusterCreateParams,
    formikActions: FormikHelpers<ClusterCreateParams>,
  ) => {
    formikActions.setStatus({ error: null });

    // async validation for cluster name - run only on submit
    try {
      const { data: clusters } = await getClusters();
      const names = clusters.map((c) => c.name);
      if (names.includes(values.name)) {
        return formikActions.setFieldError('name', `Name "${values.name}" is already taken.`);
      }
    } catch (e) {
      console.error('Failed to perform unique cluster name validation.', e);
    }

    try {
      const { data } = await postCluster(values);
      history.push(`${routeBasePath}/clusters/${data.id}`);
    } catch (e) {
      handleApiError<ClusterCreateParams>(e, () =>
        formikActions.setStatus({
          error: { title: 'Failed to create new cluster', message: getErrorMessage(e) },
        }),
      );
    }
  };

  return (
    <Modal
      aria-label="New Bare Metal OpenShift Cluster"
      title="New Bare Metal OpenShift Cluster"
      isOpen={true}
      onClose={closeModal}
      variant={ModalVariant.small}
      hasNoBodyWrapper
    >
      <Formik
        initialValues={{
          name: uniqueGeneratedName,
          openshiftVersion: OPENSHIFT_VERSION_OPTIONS[0].value,
          pullSecret: initialPullSecret,
        }}
        enableReinitialize
        initialStatus={{ error: initialError }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit, isSubmitting, isValid, status, setStatus }) => (
          <Form onSubmit={handleSubmit}>
            <ModalBoxBody>
              <GridGap>
                {status.error && (
                  <Alert
                    variant={AlertVariant.danger}
                    title={status.error.title}
                    actionClose={
                      <AlertActionCloseButton onClose={() => setStatus({ error: null })} />
                    }
                    isInline
                  >
                    {status.error.message}
                  </Alert>
                )}
                {isSubmitting ? (
                  <LoadingState />
                ) : (
                  <>
                    <InputField
                      innerRef={nameInputRef}
                      label="Cluster Name"
                      name="name"
                      isRequired
                    />
                    <SelectField
                      label="OpenShift Version"
                      name="openshiftVersion"
                      options={OPENSHIFT_VERSION_OPTIONS}
                      isRequired
                    />
                    <TextAreaField
                      name="pullSecret"
                      label="Pull Secret"
                      getErrorText={(error) => (
                        <>
                          {error} {pullSecretHelperText}
                        </>
                      )}
                      helperText={pullSecretHelperText}
                      isRequired
                    />
                  </>
                )}
              </GridGap>
            </ModalBoxBody>
            <ModalBoxFooter>
              <Button
                type="submit"
                variant={ButtonVariant.primary}
                isDisabled={isSubmitting || !isValid}
              >
                Continue
              </Button>
              <Button variant={ButtonVariant.secondary} onClick={closeModal}>
                Cancel
              </Button>
            </ModalBoxFooter>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};
