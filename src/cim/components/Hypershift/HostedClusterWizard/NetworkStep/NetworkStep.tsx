import { Formik } from 'formik';
import noop from 'lodash/noop';
import * as Yup from 'yup';
import * as React from 'react';
import NetworkForm from './NetworkForm';
import { NetworkStepProps, NetworkFormValues } from './types';
import {
  day2ApiVipValidationSchema,
  httpProxyValidationSchema,
  ipBlockValidationSchema,
  noProxyValidationSchema,
  sshPublicKeyValidationSchema,
} from '../../../../../common';
import { getAgentsForSelection } from '../../../helpers';

const validationSchema = Yup.lazy<NetworkFormValues>((values) =>
  Yup.object<NetworkFormValues>().shape({
    machineCIDR: Yup.string().required(),
    sshPublicKey: sshPublicKeyValidationSchema.required(),
    serviceCIDR: values.isAdvanced ? ipBlockValidationSchema : Yup.string(),
    podCIDR: values.isAdvanced ? ipBlockValidationSchema : Yup.string(),
    httpProxy: httpProxyValidationSchema(values, 'httpsProxy'),
    httpsProxy: httpProxyValidationSchema(values, 'httpProxy'), // share the schema, httpS is currently not supported
    noProxy: noProxyValidationSchema,
    nodePortAddress:
      values.apiPublishingStrategy === 'NodePort'
        ? day2ApiVipValidationSchema.required()
        : Yup.string(),
  }),
);

const NetworkStep: React.FC<NetworkStepProps> = ({
  agents,
  formRef,
  onValuesChanged,
  initAdvancedNetworking,
  initSSHPublicKey = '',
  isBMPlatform,
}) => {
  const availableAgents = getAgentsForSelection(agents).filter(
    (a) => !a.spec.clusterDeploymentName,
  );

  return (
    <Formik<NetworkFormValues>
      initialValues={{
        machineCIDR: '',
        isAdvanced: initAdvancedNetworking,
        sshPublicKey: initSSHPublicKey,
        serviceCIDR: '172.31.0.0/16',
        podCIDR: '10.132.0.0/14',
        enableProxy: false,
        httpProxy: '',
        httpsProxy: '',
        noProxy: '',
        apiPublishingStrategy: isBMPlatform ? 'NodePort' : 'LoadBalancer',
        nodePortPort: 0,
        nodePortAddress: '',
      }}
      validationSchema={validationSchema}
      innerRef={formRef}
      onSubmit={noop}
    >
      <NetworkForm agents={availableAgents} onValuesChanged={onValuesChanged} />
    </Formik>
  );
};

export default NetworkStep;
