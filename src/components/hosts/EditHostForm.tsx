import React from 'react';
import { useDispatch } from 'react-redux';
import * as Yup from 'yup';
import _ from 'lodash';
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
import { Formik } from 'formik';
import { InputField } from '../ui/formik';
import { handleApiError, getErrorMessage } from '../../api/utils';
import { Host, Inventory, Cluster, ClusterUpdateParams } from '../../api/types';
import { patchCluster } from '../../api/clusters';
import {
  hostnameValidationSchema,
  uniqueHostnameValidationSchema,
} from '../ui/formik/validationSchemas';
import GridGap from '../ui/GridGap';
import StaticTextField from '../ui/StaticTextField';
import { AlertsContext } from '../AlertsContextProvider';
import { updateCluster } from '../../features/clusters/currentClusterSlice';
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
      uniqueHostnameValidationSchema(initialValues.hostname, hosts),
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
  const { addAlert } = React.useContext(AlertsContext);

  const { requestedHostname } = host;
  const { hostname } = inventory;

  const initialValues: HostUpdateParams = {
    hostId: host.id,
    hostname: requestedHostname || '',
  };

  const handleSubmit = async (values: HostUpdateParams) => {
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
    } catch (e) {
      handleApiError(e, () =>
        addAlert({ title: 'Failed to update host', message: getErrorMessage(e) }),
      );
    }

    onSuccess();
  };

  return (
    <Formik
      initialValues={initialValues}
      initialStatus={{ error: null }}
      validationSchema={validationSchema(initialValues, cluster.hosts)}
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
                isDisabled={!canHostnameBeChanged(host.status)}
              />
            </GridGap>
          </ModalBoxBody>
          <ModalBoxFooter>
            <Button
              key="submit"
              type={ButtonType.submit}
              isDisabled={!!status.error /* TODO: use gray */}
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
