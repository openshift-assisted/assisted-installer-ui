import React from 'react';
import { useDispatch } from 'react-redux';
import * as Yup from 'yup';
import {
  Button,
  ButtonVariant,
  ButtonType,
  Form,
  ModalBoxBody,
  ModalBoxFooter,
  AlertVariant,
  Alert,
  AlertActionCloseButton,
} from '@patternfly/react-core';
import { Formik, FormikHelpers } from 'formik';
import { InputField } from '../ui/formik';
import { handleApiError, getErrorMessage } from '../../api/utils';
import { Host, Inventory, Cluster, ClusterUpdateParams } from '../../api/types';
import { patchCluster } from '../../api/clusters';
import {
  hostnameValidationSchema,
  uniqueHostnameValidationSchema,
} from '../ui/formik/validationSchemas';
import GridGap from '../ui/GridGap';
import { StaticTextField } from '../ui/StaticTextField';
import { updateCluster } from '../../reducers/clusters/currentClusterSlice';
import { canHostnameBeChanged } from './utils';

export type HostUpdateParams = {
  hostId: string; // identifier, uuid
  hostname: string; // requested change
};

type EditHostFormProps = {
  host: Host;
  inventory: Inventory;
  cluster: Cluster;
  onCancel: () => void;
  onSuccess: () => void;
};

const validationSchema = (initialValues: HostUpdateParams, hosts: Host[] = []) =>
  Yup.object().shape({
    hostname: hostnameValidationSchema.concat(
      uniqueHostnameValidationSchema(initialValues.hostname, hosts).notOneOf(
        ['localhost'],
        `Hostname 'localhost' is not allowed.`,
      ),
    ),
  });

const EditHostForm: React.FC<EditHostFormProps> = ({
  host,
  inventory,
  cluster,
  onCancel,
  onSuccess,
}) => {
  const dispatch = useDispatch();
  const hostnameInputRef = React.useRef<HTMLInputElement>();
  React.useEffect(() => hostnameInputRef.current?.focus(), []);

  const { requestedHostname } = host;
  const { hostname } = inventory;

  const initialValues: HostUpdateParams = {
    hostId: host.id,
    hostname: requestedHostname || '',
  };

  const handleSubmit = async (
    values: HostUpdateParams,
    formikActions: FormikHelpers<HostUpdateParams>,
  ) => {
    if (values.hostname === initialValues.hostname) {
      // no change to save
      onSuccess();
      return;
    }

    const params: ClusterUpdateParams = {};
    params.hostsNames = [
      {
        id: values.hostId,
        hostname: values.hostname,
      },
    ];

    try {
      const { data } = await patchCluster(cluster.id, params);
      dispatch(updateCluster(data));
      onSuccess();
    } catch (e) {
      handleApiError(e, () =>
        formikActions.setStatus({
          error: {
            title: 'Failed to update host',
            message: getErrorMessage(e),
          },
        }),
      );
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      initialStatus={{ error: null }}
      validationSchema={validationSchema(initialValues, cluster.hosts)}
      onSubmit={handleSubmit}
    >
      {({ handleSubmit, status, setStatus, isSubmitting, isValid, dirty }) => (
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
              <StaticTextField name="discoveredHostname" label="Discovered Hostname">
                {hostname || ''}
              </StaticTextField>
              <InputField
                label="Requested hostname"
                name="hostname"
                ref={hostnameInputRef}
                helperText="This name will replace the original discovered hostname after installation."
                isRequired
                isDisabled={!canHostnameBeChanged(host.status)}
              />
            </GridGap>
          </ModalBoxBody>
          <ModalBoxFooter>
            <Button
              key="submit"
              type={ButtonType.submit}
              isDisabled={isSubmitting || !isValid || !dirty}
            >
              Save
            </Button>
            <Button key="cancel" variant={ButtonVariant.link} onClick={onCancel}>
              Cancel
            </Button>
          </ModalBoxFooter>
        </Form>
      )}
    </Formik>
  );
};

export default EditHostForm;
