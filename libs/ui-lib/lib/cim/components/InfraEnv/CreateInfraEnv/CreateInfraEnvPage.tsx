import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom-v5-compat';
import {
  Alert,
  AlertVariant,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Card,
  CardBody,
  CardTitle,
  Grid,
  GridItem,
  PageSection,
  PageSectionVariants,
  Split,
  SplitItem,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import PencilAltIcon from '@patternfly/react-icons/dist/js/icons/pencil-alt-icon';
import { Formik, FormikProps } from 'formik';
import { k8sCreate, QueryParams, useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';
import { useInfraEnvResources } from './useInfraEnvResources';
import {
  EnvironmentStepFormValues,
  getInfraEnv,
  getPullSecretSecret,
  getRole,
  initialValues,
  validationSchema,
} from './utils';
import CreateInfraEnvForm from './CreateInfraEnvForm';
import { InfraEnvModel, RoleModel, SecretModel } from '../../../types/models';
import { getRichTextValidation, LoadingState } from '../../../../common';
import { getErrorMessage } from '../../../../common/utils';
import YamlEditor from '../../YamlEditor/YamlEditor';

import MainIcon from '../../../logos/OnPremiseBannerIcon.svg';

const onSubmit = async (values: EnvironmentStepFormValues, ns: string, createRole: boolean) => {
  const secret = getPullSecretSecret(values, ns);
  const infraEnv = getInfraEnv(values, ns);

  const create = async (queryParams?: QueryParams) => {
    await k8sCreate({ data: secret, model: SecretModel, queryParams });
    await k8sCreate({ data: infraEnv, model: InfraEnvModel, queryParams });
    createRole && (await k8sCreate({ data: getRole(ns), model: RoleModel, queryParams }));
  };

  await create({ dryRun: 'All' });
  await create();
  return infraEnv;
};

const CreateInfraEnvPage: React.FC = () => {
  const [ns] = useActiveNamespace();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [editYaml, setEditYaml] = React.useState(false);
  const [submitErr, setSubmitError] = React.useState<string>();

  const [usedNames, osImages, credentials, createRole, loaded, error] = useInfraEnvResources(ns);

  let content: JSX.Element;
  if (!loaded) {
    content = <LoadingState />;
  } else if (error) {
    content = (
      <Alert isInline variant="danger" title={t('ai:Failed to fetch resources')}>
        {getErrorMessage(error)}
      </Alert>
    );
  } else {
    content = (
      <Formik
        initialValues={initialValues}
        validate={getRichTextValidation(validationSchema(usedNames, t))}
        onSubmit={async (values: EnvironmentStepFormValues) => {
          setSubmitError(undefined);
          try {
            const infraEnv = await onSubmit(values, ns, createRole);
            navigate(
              `/k8s/ns/${
                infraEnv.metadata?.namespace || ''
              }/agent-install.openshift.io~v1beta1~InfraEnv/${infraEnv.metadata?.name || ''}`,
            );
          } catch (e) {
            setSubmitError(getErrorMessage(e));
          }
        }}
      >
        {({
          isValid,
          isSubmitting,
          submitForm,
          values,
        }: FormikProps<EnvironmentStepFormValues>) => {
          const yamlResources = [getInfraEnv(values, ns), getPullSecretSecret(values, ns)];
          if (createRole) {
            yamlResources.push(getRole(ns));
          }
          return (
            <>
              <Grid hasGutter>
                <GridItem>
                  <Split hasGutter>
                    <SplitItem>
                      <Title headingLevel="h1">{t('ai:Create infrastructure environment')}</Title>
                    </SplitItem>
                    <SplitItem>
                      <Button
                        variant="secondary"
                        onClick={() => setEditYaml(true)}
                        isDisabled={isSubmitting}
                        icon={<PencilAltIcon />}
                      >
                        {t('ai:Edit YAML')}
                      </Button>
                    </SplitItem>
                  </Split>
                </GridItem>
                <GridItem span={8}>
                  <CreateInfraEnvForm osImages={osImages} credentials={credentials} />
                </GridItem>
                <GridItem span={8}>
                  <Card>
                    <Split hasGutter>
                      <SplitItem>
                        <CardBody style={{ width: '200px' }}>
                          <MainIcon />
                        </CardBody>
                      </SplitItem>
                      <SplitItem isFilled>
                        <CardTitle>{t('ai:Next steps: Adding hosts')}</CardTitle>
                        <CardBody>
                          <Stack hasGutter>
                            <StackItem>
                              {t(
                                'ai:After your infrastructure environment is successfully created, open the details view and click the "Add hosts" button.',
                              )}
                            </StackItem>
                            <StackItem>
                              {t(
                                'ai:Adding hosts allows cluster creators to pull any available hosts from the infrastructure environment.',
                              )}
                            </StackItem>
                          </Stack>
                        </CardBody>
                      </SplitItem>
                    </Split>
                  </Card>
                </GridItem>
                {submitErr && (
                  <GridItem>
                    <Alert
                      variant={AlertVariant.danger}
                      title={t('ai:Error creating InfraEnv')}
                      isInline
                    >
                      {submitErr}
                    </Alert>
                  </GridItem>
                )}
                <GridItem>
                  <Split hasGutter>
                    <SplitItem>
                      <Button
                        variant="primary"
                        type="submit"
                        isDisabled={!isValid || isSubmitting}
                        onClick={() => void submitForm()}
                        isLoading={isSubmitting}
                      >
                        {t('ai:Create')}
                      </Button>
                    </SplitItem>
                    <SplitItem>
                      <Button variant="link" onClick={() => navigate(-1)} isDisabled={isSubmitting}>
                        {t('ai:Cancel')}
                      </Button>
                    </SplitItem>
                  </Split>
                </GridItem>
              </Grid>
              {editYaml && (
                <YamlEditor
                  onClose={() => setEditYaml(false)}
                  onSubmit={(res) => {
                    const infraEnv = res.find((r) => r.kind === InfraEnvModel.kind);
                    if (infraEnv) {
                      navigate(
                        `/k8s/ns/${
                          infraEnv.metadata?.namespace || ''
                        }/agent-install.openshift.io~v1beta1~InfraEnv/${
                          infraEnv.metadata?.name || ''
                        }`,
                      );
                    } else {
                      navigate('/k8s/all-namespaces/agent-install.openshift.io~v1beta1~InfraEnv');
                    }
                  }}
                  resources={yamlResources}
                />
              )}
            </>
          );
        }}
      </Formik>
    );
  }

  return (
    <>
      <PageSection variant={PageSectionVariants.light} isFilled>
        <Stack hasGutter>
          <StackItem>
            <Breadcrumb ouiaId="InfraEnvBreadcrumb">
              <BreadcrumbItem>
                <Link
                  to={`/k8s/${
                    ns === '#ALL_NS#' ? 'all-namespaces' : `ns/${ns}`
                  }/agent-install.openshift.io~v1beta1~InfraEnv`}
                >
                  {t('ai:Host inventory')}
                </Link>
              </BreadcrumbItem>
              <BreadcrumbItem isActive>{t('ai:Create infrastructure environment')}</BreadcrumbItem>
            </Breadcrumb>
          </StackItem>
          <StackItem>{content}</StackItem>
        </Stack>
      </PageSection>
    </>
  );
};

export default CreateInfraEnvPage;
