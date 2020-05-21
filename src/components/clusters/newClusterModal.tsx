import React from 'react';
import {
  ButtonVariant,
  Button,
  Form,
  Alert,
  AlertVariant,
  AlertActionCloseButton,
  Modal,
  ModalBoxFooter,
} from '@patternfly/react-core';
import { uniqueNamesGenerator, Config, adjectives, colors, animals } from 'unique-names-generator';
import * as Yup from 'yup';
import history from '../../history';
import { LoadingState } from '../ui/uiState';
import { postCluster } from '../../api/clusters';
import { Formik, FormikHelpers } from 'formik';
import { OPENSHIFT_VERSION_OPTIONS } from '../../config/constants';
import { ClusterCreateParams } from '../../api/types';
import { InputField, SelectField } from '../ui/formik';
import { handleApiError } from '../../api/utils';
import { ToolbarButton } from '../ui/Toolbar';
import {
  nameValidationSchema,
  getUniqueNameValidationSchema,
} from '../ui/formik/validationSchemas';
import { useSelector, useDispatch } from 'react-redux';
import { selectClusterNames } from '../../selectors/clusters';
import { fetchClustersAsync } from '../../features/clusters/clustersSlice';

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
  <ButtonComponent variant={ButtonVariant.primary} onClick={onClick}>
    Create New Cluster
  </ButtonComponent>
);

type NewClusterModalProps = {
  closeModal: () => void;
};

export const NewClusterModal: React.FC<NewClusterModalProps> = ({ closeModal }) => {
  const dispatch = useDispatch();
  React.useEffect(() => {
    dispatch(fetchClustersAsync());
    return () => {
      dispatch(fetchClustersAsync());
    };
  }, [dispatch]);

  const clusterNames = useSelector(selectClusterNames);

  const nameInputRef = React.useCallback((node) => {
    if (node !== null) {
      node.focus();
    }
  }, []);

  const validationSchema = React.useCallback(
    () =>
      Yup.object().shape({
        name: getUniqueNameValidationSchema(clusterNames).concat(nameValidationSchema),
        openshiftVersion: Yup.string().required('Required'),
      }),
    [clusterNames],
  );

  const handleSubmit = async (
    values: ClusterCreateParams,
    formikActions: FormikHelpers<ClusterCreateParams>,
  ) => {
    formikActions.setStatus({ error: null });
    try {
      const { data } = await postCluster(values);
      history.push(`/clusters/${data.id}`);
    } catch (e) {
      handleApiError<ClusterCreateParams>(e, () =>
        formikActions.setStatus({ error: 'Failed to create new cluster' }),
      );
    }
  };

  return (
    <Modal
      title="New Bare Metal OpenShift Cluster"
      isOpen={true}
      onClose={closeModal}
      isFooterLeftAligned
      isSmall
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
            {status.error && (
              <Alert
                variant={AlertVariant.danger}
                title={status.error}
                action={<AlertActionCloseButton onClose={() => setStatus({ error: null })} />}
                isInline
              />
            )}
            {isSubmitting ? (
              <LoadingState />
            ) : (
              <>
                <InputField innerRef={nameInputRef} label="Cluster Name" name="name" isRequired />
                <SelectField
                  label="OpenShift Version"
                  name="openshiftVersion"
                  options={OPENSHIFT_VERSION_OPTIONS}
                  isRequired
                />
              </>
            )}
            <ModalBoxFooter isLeftAligned>
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
