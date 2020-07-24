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
import { History } from 'history';
import { uniqueNamesGenerator, Config, adjectives, colors, animals } from 'unique-names-generator';
import * as Yup from 'yup';
import { LoadingState } from '../ui/uiState';
import { postCluster, getClusters } from '../../api/clusters';
import { Formik, FormikHelpers } from 'formik';
import { OPENSHIFT_VERSION_OPTIONS, routeBasePath } from '../../config/constants';
import { ClusterCreateParams } from '../../api/types';
import { InputField, SelectField } from '../ui/formik';
import GridGap from '../ui/GridGap';
import { handleApiError, getErrorMessage } from '../../api/utils';
import { ToolbarButton } from '../ui/Toolbar';
import { nameValidationSchema } from '../ui/formik/validationSchemas';

const namesConfig: Config = {
  dictionaries: [adjectives, colors, animals],
  // dictionaries: [starWars],
  separator: '-',
  length: 3,
  style: 'lowerCase',
};

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

  const validationSchema = React.useCallback(
    () =>
      Yup.object({
        name: nameValidationSchema,
        openshiftVersion: Yup.string().required('Required'),
      }),
    [],
  );

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
          name: uniqueNamesGenerator(namesConfig),
          openshiftVersion: OPENSHIFT_VERSION_OPTIONS[0].value,
        }}
        initialStatus={{ error: null }}
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
              </Button>{' '}
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
