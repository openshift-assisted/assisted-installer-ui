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
import { Formik, FormikProps } from 'formik';
import { k8sCreate, k8sGet, QueryParams } from '@openshift-console/dynamic-plugin-sdk';
import { HttpError } from '@openshift-console/dynamic-plugin-sdk/lib/utils/error/http-error';
import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';
import { useInfraEnvResources } from './useInfraEnvResources';
import {
  EnvironmentStepFormValues,
  getInfraEnv,
  getNamespace,
  getPullSecretSecret,
  getRole,
  initialValues,
  validationSchema,
} from './utils';
import CreateInfraEnvForm from './CreateInfraEnvForm';
import { InfraEnvModel, NamespaceModel, RoleModel, SecretModel } from '../../../types/models';
import { getRichTextValidation, LoadingState } from '../../../../common';
import { getErrorMessage } from '../../../../common/utils';
import YamlEditor from '../../YamlEditor/YamlEditor';

import MainIcon from '../../../logos/OnPremiseBannerIcon.svg';

const CreateInfraEnvPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [editYaml, setEditYaml] = React.useState(false);
  const [submitErr, setSubmitError] = React.useState<string>();

  const [usedNames, osImages, credentials, loaded, error] = useInfraEnvResources();

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
          const secret = getPullSecretSecret(values);
          const infraEnv = getInfraEnv(values);
          const role = getRole(values);
          const ns = getNamespace(values);

          let createNs = false;
          try {
            await k8sGet({
              model: NamespaceModel,
              name: infraEnv.metadata?.name,
            });
          } catch (e) {
            if ((e as HttpError).code === 404) {
              createNs = true;
            } else {
              setSubmitError(
                t('ai:Failed to check if namespace {{namespace}} exists', {
                  namespace: infraEnv.metadata?.name,
                }),
              );
              return;
            }
          }

          let createRole = createNs;

          if (!createNs)
            try {
              await k8sGet({
                model: RoleModel,
                name: role.metadata.name,
                ns: role.metadata.namespace,
              });
            } catch (e) {
              if ((e as HttpError).code === 404) {
                createRole = true;
              } else {
                setSubmitError(
                  t('ai:Failed to check if role {{role}} exists', {
                    role: role.metadata.name,
                  }),
                );
                return;
              }
            }

          const create = async (queryParams?: QueryParams) => {
            await k8sCreate({ data: secret, model: SecretModel, queryParams });
            await k8sCreate({ data: infraEnv, model: InfraEnvModel, queryParams });
            createRole && (await k8sCreate({ data: role, model: RoleModel, queryParams }));
          };

          try {
            createNs && (await k8sCreate({ data: ns, model: NamespaceModel }));
            await create({ dryRun: 'All' });
            await create();
            navigate(
              `/multicloud/infrastructure/environments/details/${
                infraEnv.metadata?.namespace || ''
              }/${infraEnv.metadata?.name || ''}`,
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
        }: FormikProps<EnvironmentStepFormValues>) => (
          <>
            <Grid hasGutter>
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
                    <Button
                      variant="secondary"
                      onClick={() => setEditYaml(true)}
                      isDisabled={isSubmitting}
                    >
                      {t('ai:Edit YAML')}
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
                      `/multicloud/infrastructure/environments/details/${
                        infraEnv.metadata?.namespace || ''
                      }/${infraEnv.metadata?.name || ''}`,
                    );
                  } else {
                    navigate('/multicloud/infrastructure/environments');
                  }
                }}
                resources={[
                  getNamespace(values),
                  getInfraEnv(values),
                  getPullSecretSecret(values),
                  getRole(values),
                ]}
              />
            )}
          </>
        )}
      </Formik>
    );
  }

  return (
    <PageSection variant={PageSectionVariants.light} isFilled>
      <Stack hasGutter>
        <StackItem>
          <Breadcrumb ouiaId="InfraEnvBreadcrumb">
            <BreadcrumbItem to="/multicloud/infrastructure/environments">
              <Link to="/multicloud/infrastructure/environments">{t('ai:Host inventory')}</Link>
            </BreadcrumbItem>
            <BreadcrumbItem isActive>{t('ai:Create infrastructure environment')}</BreadcrumbItem>
          </Breadcrumb>
        </StackItem>
        <StackItem>
          <Title headingLevel="h1">{t('ai:Create infrastructure environment')}</Title>
        </StackItem>
        <StackItem>{content}</StackItem>
      </Stack>
    </PageSection>
  );
};

export default CreateInfraEnvPage;
