import * as React from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import noop from 'lodash/noop';
import HostsForm from './HostsForm';
import { HostsStepProps, HostsFormValues, NodePoolFormValue } from './types';
import { Alert, AlertVariant, Stack, StackItem } from '@patternfly/react-core';
import { ExternalLink } from '../../../../../common';
import { useTranslation } from '../../../../../common/hooks/use-translation-wrapper';
import { Trans } from 'react-i18next';

const validationSchema = Yup.object<HostsFormValues>().shape({
  agentNamespace: Yup.string().required(),
  nodePools: Yup.array().of(
    Yup.lazy<NodePoolFormValue>((nodePool) =>
      Yup.object()
        .shape({
          name: Yup.string().required(),
          clusterName: Yup.string().required(),
          count: Yup.number().min(1),
          autoSelectedAgentIDs: nodePool.autoSelectHosts
            ? Yup.array<string>().min(nodePool.count)
            : Yup.array<string>(),
          selectedAgentIDs: nodePool.autoSelectHosts
            ? Yup.array<string>()
            : Yup.array<string>().min(1, 'Please select al least one host for the cluster.'),
          autoSelectHosts: Yup.boolean(),
          agentLabels: Yup.array().of(Yup.string()),
          releaseImage: Yup.string().required(),
        })
        .required(),
    ),
  ),
});

const HostsStep: React.FC<HostsStepProps> = ({
  formRef,
  onValuesChanged,
  infraEnvs,
  agents,
  clusterName,
  initInfraEnv,
  initNodePools,
  initReleaseImage,
}) => {
  const { t } = useTranslation();
  return (
    <Stack hasGutter>
      <StackItem>
        {t(
          'ai:Define the control plane location and quantity of worker nodes and node pools to create for your cluster. Additional worker nodes and node pools can be added after the cluster is created.',
        )}
      </StackItem>
      <StackItem>
        <Alert
          isInline
          isPlain
          title={t('ai:Control plane location')}
          variant={AlertVariant.info}
          actionLinks={
            <ExternalLink href="https://www.google.com">{t('ai:Learn more')}</ExternalLink>
          }
        >
          <Trans
            t={t}
            components={{ bold: <strong /> }}
            i18nKey="ai:Currently, <bold>local-cluster</bold> will be selected as the hosting service cluster in order to run OpenShift in a hyperscale manner with many control planes hosted on a central hosting service cluster."
          ></Trans>
        </Alert>
      </StackItem>
      <StackItem>
        <Formik<HostsFormValues>
          initialValues={{
            agentNamespace: initInfraEnv || infraEnvs[0].metadata?.namespace || '',
            nodePools: initNodePools || [
              {
                name: `${clusterName}-1`,
                count: 1,
                autoSelectedAgentIDs: [],
                autoSelectHosts: true,
                selectedAgentIDs: [],
                agentLabels: [],
                releaseImage: initReleaseImage,
                clusterName,
              },
            ],
          }}
          validationSchema={validationSchema}
          innerRef={formRef}
          onSubmit={noop}
        >
          <HostsForm
            onValuesChanged={onValuesChanged}
            infraEnvs={infraEnvs}
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
