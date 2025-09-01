import React from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { k8sPatch, Patch } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, AlertActionLink, Grid, GridItem, Text, TextVariants } from '@patternfly/react-core';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';
import { ClusterWizardStepHeader, useTranslation } from '../../../../common';
import { AgentClusterInstallK8sResource, AgentClusterInstallModel } from '../../../types';
import { ConfigMapForm, CustomManifestFormType } from './ConfigMapForm';
import { appendPatch } from '../../../utils';

export const ClusterDeploymentCustomManifestsStep = ({
  agentClusterInstall,
}: {
  agentClusterInstall: AgentClusterInstallK8sResource;
}) => {
  const { t } = useTranslation();

  const initialValues: CustomManifestFormType = {
    configMaps:
      agentClusterInstall.spec?.manifestsConfigMapRefs?.map(({ name }) => ({
        name,
        valid: false,
      })) || [],
  };

  const validationSchema = Yup.lazy((values: CustomManifestFormType) =>
    Yup.object<CustomManifestFormType>({
      configMaps: Yup.array()
        .of(
          Yup.object().shape({
            name: Yup.string().required(t('ai:Config map name is required')),
            valid: Yup.boolean().isTrue(t('ai:Config map not found')),
            manifestNames: Yup.array()
              .of(Yup.string())
              .test(
                'unique-manifests',
                t(
                  'ai:Manifest names in each config map should be unique across all referenced config maps.',
                ),
                (value) =>
                  // check if another config map has any manifests with the same names as this one
                  values.configMaps
                    .flatMap(({ manifestNames }) => manifestNames)
                    .filter((v) => value?.includes(v)).length === value?.length,
              ),
          }),
        )
        .min(
          agentClusterInstall.spec?.platformType === 'External' ? 1 : 0,
          t('ai:At least one config map is required'),
        ),
    }),
  );

  const onSubmit = async (values: CustomManifestFormType) => {
    const patches: Patch[] = [];
    appendPatch(
      patches,
      '/spec/manifestsConfigMapRefs',
      values.configMaps.map(({ name }) => ({ name })),
      agentClusterInstall.spec?.manifestsConfigMapRefs,
    );

    if (patches.length > 0) {
      await k8sPatch({
        model: AgentClusterInstallModel,
        resource: agentClusterInstall,
        data: patches,
      });
    }
  };

  return (
    <Grid hasGutter>
      <GridItem>
        <ClusterWizardStepHeader>{t('ai:Custom manifests')}</ClusterWizardStepHeader>
      </GridItem>
      <GridItem>
        <Alert
          variant="info"
          isInline
          title={t('ai:Add custom manifests')}
          actionLinks={[
            <AlertActionLink
              key="define-config-map"
              component={'a'}
              href={`/k8s/ns/${
                agentClusterInstall.metadata?.namespace as string
              }/core~v1~ConfigMap`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('ai:Define a config map')} <ExternalLinkAltIcon />
            </AlertActionLink>,
          ]}
        >
          <Text component={TextVariants.p}>
            {t(
              'ai:Define a config map with your custom manifests and select it in the form below.',
            )}
          </Text>
          <Text component={TextVariants.p}>
            {t(
              'ai:Manifest names in each config map should be unique across all referenced config maps.',
            )}
          </Text>
        </Alert>
      </GridItem>
      <GridItem>
        <Formik
          initialValues={initialValues}
          onSubmit={onSubmit}
          validationSchema={validationSchema}
        >
          <ConfigMapForm namespace={agentClusterInstall.metadata?.namespace as string} />
        </Formik>
      </GridItem>
    </Grid>
  );
};
