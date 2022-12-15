import * as React from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import noop from 'lodash/noop';
import { Stack, StackItem } from '@patternfly/react-core';
import HostsForm from './HostsForm';
import { HostsStepProps, HostsFormValues, NodePoolFormValue } from './types';
import { useTranslation } from '../../../../../common/hooks/use-translation-wrapper';
import { getAgentsForSelection } from '../../../helpers';
import { INFRAENV_AGENTINSTALL_LABEL_KEY } from '../../../common';
import { TFunction } from 'i18next';
import { NodePoolK8sResource } from '../../types';

const validationSchema = (clusterName: string, nodePools: NodePoolK8sResource[], t: TFunction) =>
  Yup.lazy<HostsFormValues>((values) =>
    Yup.object<HostsFormValues>().shape({
      agentNamespace: Yup.string().required(t('ai:Required field')),
      nodePools: Yup.array().of(
        Yup.object<NodePoolFormValue>()
          .shape({
            name: Yup.string()
              .required(t('ai:Required field'))
              .test(t('ai:Must be unique'), t('ai:Must be unique'), (value) => {
                if (!value) {
                  return true;
                }
                return (
                  values.nodePools.filter(({ name }) => name === value).length === 1 &&
                  !nodePools.some(
                    ({ metadata }) =>
                      metadata?.name === value && metadata?.namespace === clusterName,
                  )
                );
              }),
            clusterName: Yup.string().required(t('ai:Required field')),
            count: Yup.number(),
            releaseImage: Yup.string().required(t('ai:Required field')),
          })
          .required(t('ai:Required field')),
      ),
    }),
  );

const HostsStep: React.FC<HostsStepProps> = ({
  formRef,
  onValuesChanged,
  infraEnvs,
  agents,
  clusterName,
  initInfraEnv,
  initNodePools,
  initReleaseImage,
  nodePools,
}) => {
  const { t } = useTranslation();
  const availableAgents = getAgentsForSelection(agents);

  const infraEnvsWithAgents = infraEnvs.filter((ie) =>
    availableAgents.some(
      (a) =>
        a.metadata?.labels?.[INFRAENV_AGENTINSTALL_LABEL_KEY] === ie.metadata?.name &&
        a.metadata?.namespace === ie.metadata?.namespace &&
        !a.spec.clusterDeploymentName,
    ),
  );
  return (
    <Stack hasGutter>
      <StackItem>
        {t(
          'ai:Define the quantity of worker nodes and nodepools to create for your cluster. Additional worker nodes and nodepools can be added after the cluster is created.',
        )}
      </StackItem>
      <StackItem>
        <Formik<HostsFormValues>
          initialValues={{
            agentNamespace: initInfraEnv || infraEnvsWithAgents[0]?.metadata?.namespace || '',
            nodePools: initNodePools || [
              {
                name: `nodepool-${clusterName}-1`,
                count: 1,
                agentLabels: [],
                releaseImage: initReleaseImage,
                clusterName,
              },
            ],
          }}
          validationSchema={validationSchema(clusterName, nodePools, t)}
          innerRef={formRef}
          onSubmit={noop}
        >
          <HostsForm
            onValuesChanged={onValuesChanged}
            infraEnvs={infraEnvsWithAgents}
            agents={agents}
            clusterName={clusterName}
            initReleaseImage={initReleaseImage}
          />
        </Formik>
      </StackItem>
    </Stack>
  );
};

export default HostsStep;
