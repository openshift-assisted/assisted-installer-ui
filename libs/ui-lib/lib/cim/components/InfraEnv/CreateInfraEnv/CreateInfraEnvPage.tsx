import * as React from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import { getRichTextValidation, LoadingState } from '../../../../common';
import { getErrorMessage } from '../../../../common/utils';
import {
  Alert,
  AlertVariant,
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
} from '@patternfly/react-core';
import { Formik, FormikProps } from 'formik';
import { k8sCreate, k8sGet } from '@openshift-console/dynamic-plugin-sdk';
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
import MainIcon from '../../../logos/OnPremiseBannerIcon.svg';
import { InfraEnvModel, NamespaceModel, RoleModel, SecretModel } from '../../../types/models';

const CreateInfraEnvPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
          const secret = getPullSecretSecret(values);
          const infraEnv = getInfraEnv(values);
          const role = getRole(values);
          const ns = getNamespace(values);

          let createRole = true;
          try {
            await k8sGet({
              model: SecretModel,
              name: role.metadata.name,
              ns: role.metadata.namespace,
            });
          } catch {
            createRole = false;
          }

          let createNs = false;
          try {
            await k8sGet({
              model: NamespaceModel,
              name: infraEnv.metadata?.name,
            });
          } catch {
            createNs = true;
          }

          try {
            createNs && (await k8sCreate({ data: ns, model: NamespaceModel }));
            await k8sCreate({ data: secret, model: SecretModel });
            await k8sCreate({ data: infraEnv, model: InfraEnvModel });
            createRole && (await k8sCreate({ data: role, model: RoleModel }));
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
        {({ isValid, isSubmitting, submitForm }: FormikProps<EnvironmentStepFormValues>) => (
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
                  <Button variant="link" onClick={() => navigate(-1)} isDisabled={isSubmitting}>
                    {t('ai:Cancel')}
                  </Button>
                </SplitItem>
              </Split>
            </GridItem>
          </Grid>
        )}
      </Formik>
    );
  }

  return (
    <PageSection variant={PageSectionVariants.light} isFilled>
      {content}
    </PageSection>
  );
};

export default CreateInfraEnvPage;
