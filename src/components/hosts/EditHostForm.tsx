import React from 'react';
import * as Yup from 'yup';
import _ from 'lodash';
import {
  Button,
  ButtonVariant,
  Form,
  ModalBoxBody,
  ModalBoxFooter,
  AlertVariant,
  Alert,
  AlertActionCloseButton,
} from '@patternfly/react-core';
import { InputField } from '../ui/formik';
import { Formik, FormikHelpers } from 'formik';
import { createClusterDownloadsImage } from '../../api/clusters';
import { handleApiError, getErrorMessage } from '../../api/utils';
import { ImageCreateParams, Host, Inventory } from '../../api/types';
import { hostnameValidationSchema } from '../ui/formik/validationSchemas';
import GridGap from '../ui/GridGap';
import StaticTextField from '../ui/StaticTextField';

const validationSchema = Yup.object().shape({
  hostname: hostnameValidationSchema,
});

export type HostUpdateParams = {
  hostId: string; // identifier, uuid
  hostname: string; // requested change
};

type EditHostFormProps = {
  host: Host;
  inventory: Inventory;
  onCancel: () => void;
  onSuccess: () => void;
};

const EditHostForm: React.FC<EditHostFormProps> = ({ host, inventory, onCancel, onSuccess }) => {
  const { requestedHostname } = host;
  const { hostname } = inventory;

  const initialValues: HostUpdateParams = {
    hostId: host.id,
    hostname: requestedHostname || '',
  };

  /*
  React.useEffect(() => {
    cancelSourceRef.current = Axios.CancelToken.source();
    return () => cancelSourceRef.current?.cancel('Image generation cancelled by user.');
  }, []);
  */
  // TODO
  /*
  const handleSubmit = async (
    values: DiscoveryImageFormValues,
    formikActions: FormikHelpers<DiscoveryImageFormValues>,
  ) => {
    if (clusterId) {
      try {
        const params = _.omit(values, ['enableProxy']);
        const { data: cluster } = await createClusterDownloadsImage(clusterId, params, {
          cancelToken: cancelSourceRef.current?.token,
        });
        onSuccess(cluster.imageInfo);
      } catch (error) {
        handleApiError<ImageCreateParams>(error, () => {
          formikActions.setStatus({
            error: {
              title: 'Failed to download the discovery Image',
              message: getErrorMessage(error),
            },
          });
        });
      }
    }
  };
  */

  const handleSubmit = (
    values: HostUpdateParams,
    formikActions: FormikHelpers<HostUpdateParams>,
  ) => {
    console.log('---- onSubmit - Formik: ', values, formikActions);
    // TODO: compose ClusterUpdate
    // TODO: dispatch cluster change
    onSuccess();
  };

  return (
    <Formik
      initialValues={initialValues}
      initialStatus={{ error: null }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ handleSubmit, status, setStatus }) => (
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
              <StaticTextField
                name="discoveredHostname"
                label="Discovered Hostname"
                value={hostname || ''}
              />
              <InputField
                label="Requested hostname"
                name="hostname"
                helperText="This name will replace the original discovered hostname after installation."
                isRequired
              />
            </GridGap>
          </ModalBoxBody>
          <ModalBoxFooter>
            <Button key="submit" type="submit" isDisabled={!!status.error /* TODO: use gray */}>
              Save
            </Button>
            <Button key="cancel" variant="link" onClick={onCancel}>
              Cancel
            </Button>
          </ModalBoxFooter>
        </Form>
      )}
    </Formik>
  );
};

export default EditHostForm;
