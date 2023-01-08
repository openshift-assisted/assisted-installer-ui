import { Formik, FormikProps, useFormikContext } from 'formik';
import noop from 'lodash/noop';
import * as React from 'react';
import { Ref } from 'react';
import { ClusterDetailsValues, getRichTextValidation } from '../../../common';
import {
  AgentClusterInstallK8sResource,
  AgentK8sResource,
  ClusterDeploymentK8sResource,
} from '../../types';
import { ClusterImageSetK8sResource } from '../../types/k8s/cluster-image-set';
import ClusterDeploymentDetailsForm from './ClusterDeploymentDetailsForm';
import { useDetailsFormik } from './ClusterDeploymentDetailsStep';
import { ClusterDetailsFormFieldsProps } from './ClusterDetailsFormFields';

type DetailsFormBodyProps = {
  clusterImages: ClusterImageSetK8sResource[];
  onValuesChanged: (values: ClusterDetailsValues, initRender: boolean) => void;
  clusterDeployment?: ClusterDeploymentK8sResource;
  agentClusterInstall?: AgentClusterInstallK8sResource;
  agents?: AgentK8sResource[];
  defaultBaseDomain?: string;
  pullSecret?: string;
  extensionAfter: ClusterDetailsFormFieldsProps['extensionAfter'];
};

const DetailsFormBody: React.FC<DetailsFormBodyProps> = ({
  onValuesChanged,
  clusterDeployment,
  agentClusterInstall,
  clusterImages,
  pullSecret,
  extensionAfter,
}) => {
  const { values } = useFormikContext<ClusterDetailsValues>();
  const initRenderRef = React.useRef(true);
  React.useEffect(() => onValuesChanged(values, initRenderRef.current), [onValuesChanged, values]);
  React.useEffect(() => {
    initRenderRef.current = false;
  }, []);

  return (
    <ClusterDeploymentDetailsForm
      clusterDeployment={clusterDeployment}
      agentClusterInstall={agentClusterInstall}
      clusterImages={clusterImages}
      pullSecret={pullSecret}
      extensionAfter={extensionAfter}
    />
  );
};

type ACMClusterDeploymentDetailsStepProps = DetailsFormBodyProps & {
  usedClusterNames: string[];
  formRef: Ref<FormikProps<ClusterDetailsValues>>;
};

const ACMClusterDeploymentDetailsStep: React.FC<ACMClusterDeploymentDetailsStepProps> = ({
  clusterDeployment,
  agentClusterInstall,
  clusterImages,
  formRef,
  onValuesChanged,
  usedClusterNames,
  agents,
  defaultBaseDomain,
  pullSecret,
  extensionAfter,
}) => {
  const [initialValues, validationSchema] = useDetailsFormik({
    clusterDeployment,
    agentClusterInstall,
    clusterImages,
    usedClusterNames,
    agents,
    defaultBaseDomain,
    pullSecret,
  });
  return (
    <Formik
      initialValues={initialValues}
      validate={getRichTextValidation(validationSchema)}
      innerRef={formRef}
      onSubmit={noop}
    >
      <DetailsFormBody
        clusterDeployment={clusterDeployment}
        agentClusterInstall={agentClusterInstall}
        onValuesChanged={onValuesChanged}
        clusterImages={clusterImages}
        pullSecret={pullSecret}
        extensionAfter={extensionAfter}
      />
    </Formik>
  );
};

export default ACMClusterDeploymentDetailsStep;
