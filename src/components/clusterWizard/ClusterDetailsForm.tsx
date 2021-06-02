import React from 'react';
import * as Yup from 'yup';
import _ from 'lodash';
import { Formik, FormikHelpers } from 'formik';
import { Cluster, ClusterCreateParams, ClusterUpdateParams, ManagedDomain } from '../../api/types';
import ClusterWizardStep from './ClusterWizardStep';
import {
  dnsNameValidationSchema,
  nameValidationSchema,
  validJSONSchema,
} from '../ui/formik/validationSchemas';
import { Form, Grid, GridItem } from '@patternfly/react-core';
import InputField from '../ui/formik/InputField';
import SelectField from '../ui/formik/SelectField';
import PullSecret from '../clusters/PullSecret';
import CheckboxField from '../ui/formik/CheckboxField';
import { canNextClusterDetails } from './wizardTransition';
import { OpenshiftVersionOptionType } from '../../types/versions';
import OpenShiftVersionSelect from '../clusterConfiguration/OpenShiftVersionSelect';
import { StaticTextField } from '../ui/StaticTextField';
import SNOControlGroup from '../clusterConfiguration/SNOControlGroup';
import ClusterWizardStepHeader from './ClusterWizardStepHeader';
import ClusterWizardFooter from './ClusterWizardFooter';
import { getFormikErrorFields } from '../ui/formik/utils';

type ClusterDetailsFormProps = {
  cluster?: Cluster;
  pullSecret: string;
  managedDomains: ManagedDomain[];
  versions: OpenshiftVersionOptionType[];
  usedClusterNames: string[];

  navigation: React.ReactNode;

  moveNext: () => void;
  handleClusterCreate: (params: ClusterCreateParams) => Promise<void>;
  handleClusterUpdate: (clusterId: Cluster['id'], params: ClusterUpdateParams) => Promise<void>;
};

type ClusterDetailsValues = {
  name: string;
  highAvailabilityMode: 'Full' | 'None';
  openshiftVersion: string;
  pullSecret: string;
  baseDnsDomain: string;
  SNODisclaimer: boolean;
  useRedHatDnsService: boolean;
};

const getDefaultOpenShiftVersion = (versions: OpenshiftVersionOptionType[]) =>
  versions.find((v) => v.default)?.value || versions[0]?.value || '';

const getInitialValues = (props: ClusterDetailsFormProps): ClusterDetailsValues => {
  const { cluster, pullSecret, managedDomains, versions } = props;
  const {
    name = '',
    highAvailabilityMode = 'Full',
    baseDnsDomain = '',
    openshiftVersion = getDefaultOpenShiftVersion(versions),
  } = cluster || {};
  return {
    name,
    highAvailabilityMode,
    openshiftVersion,
    pullSecret,
    baseDnsDomain,
    SNODisclaimer: highAvailabilityMode === 'None',
    useRedHatDnsService:
      !!baseDnsDomain && managedDomains.map((d) => d.domain).includes(baseDnsDomain),
  };
};

const getValidationSchema = (usedClusterNames: string[], cluster?: Cluster) =>
  Yup.lazy<{ baseDnsDomain: string }>((values) => {
    if (cluster?.pullSecretSet) {
      return Yup.object({
        name: nameValidationSchema(usedClusterNames, values.baseDnsDomain),
        baseDnsDomain: dnsNameValidationSchema.required('Base Domain is required.'),
      });
    }
    return Yup.object({
      name: nameValidationSchema(usedClusterNames, values.baseDnsDomain),
      pullSecret: validJSONSchema.required('Pull secret must be provided.'),
      baseDnsDomain: dnsNameValidationSchema.required('Base Domain is required.'),
      SNODisclaimer: Yup.boolean().when('highAvailabilityMode', {
        is: 'None',
        then: Yup.bool().oneOf([true], 'Confirm the Single Node OpenShift disclaimer to continue.'),
      }),
    });
  });

const ClusterDetailsForm: React.FC<ClusterDetailsFormProps> = (props) => {
  const {
    cluster,
    pullSecret,
    managedDomains,
    versions,
    usedClusterNames = [],
    moveNext,
    handleClusterUpdate,
    handleClusterCreate,
    navigation,
  } = props;
  const nameInputRef = React.useRef<HTMLInputElement>();
  React.useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const handleSubmit = async (values: ClusterDetailsValues) => {
    const params: ClusterCreateParams = _.omit(values, ['useRedHatDnsService', 'SNODisclaimer']);
    if (cluster) {
      await handleClusterUpdate(cluster.id, params);
    } else {
      await handleClusterCreate(params);
    }
  };

  const handleOnNext = (
    dirty: boolean,
    submitForm: FormikHelpers<unknown>['submitForm'],
    cluster?: Cluster,
  ): (() => Promise<void> | void) => {
    let fn: () => Promise<void> | void = submitForm;
    if (!dirty && !_.isUndefined(cluster) && canNextClusterDetails({ cluster })) {
      fn = moveNext;
    }

    return fn;
  };

  const initialValues = getInitialValues(props);
  const validationSchema = getValidationSchema(usedClusterNames, cluster);

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ submitForm, isSubmitting, isValid, dirty, values, setFieldValue, errors, touched }) => {
        const { name: clusterName, baseDnsDomain, useRedHatDnsService } = values;
        const errorFields = getFormikErrorFields(errors, touched);

        const baseDnsHelperText = (
          <>
            All DNS records must be subdomains of this base and include the cluster name. This
            cannot be changed after cluster installation. The full cluster address will be: <br />
            <strong>
              {clusterName || '[Cluster Name]'}.{baseDnsDomain || '[example.com]'}
            </strong>
          </>
        );

        const toggleRedHatDnsService = (checked: boolean) =>
          setFieldValue('baseDnsDomain', checked ? managedDomains.map((d) => d.domain)[0] : '');

        const form = (
          <>
            <Grid hasGutter>
              <GridItem>
                <ClusterWizardStepHeader cluster={cluster}>Cluster Details</ClusterWizardStepHeader>
              </GridItem>
              <GridItem span={12} lg={10} xl={9} xl2={7}>
                <Form id="wizard-cluster-details__form">
                  <InputField ref={nameInputRef} label="Cluster Name" name="name" isRequired />
                  {!!managedDomains.length && (
                    <CheckboxField
                      name="useRedHatDnsService"
                      label="Use a temporary 60-day domain"
                      helperText="A base domain will be provided for temporary, non-production clusters."
                      onChange={toggleRedHatDnsService}
                    />
                  )}
                  {values.useRedHatDnsService ? (
                    <SelectField
                      label="Base Domain"
                      name="baseDnsDomain"
                      helperText={baseDnsHelperText}
                      options={managedDomains.map((d) => ({
                        label: `${d.domain} (${d.provider})`,
                        value: d.domain,
                      }))}
                      isRequired
                    />
                  ) : (
                    <InputField
                      label="Base Domain"
                      name="baseDnsDomain"
                      helperText={baseDnsHelperText}
                      placeholder="example.com"
                      isDisabled={useRedHatDnsService}
                      isRequired
                    />
                  )}
                  <SNOControlGroup isDisabled={!!cluster} versions={versions} />
                  {cluster ? (
                    <StaticTextField name="openshiftVersion" label="OpenShift version" isRequired>
                      OpenShift {cluster.openshiftVersion}
                    </StaticTextField>
                  ) : (
                    <OpenShiftVersionSelect versions={versions} />
                  )}
                  {!cluster?.pullSecretSet && <PullSecret pullSecret={pullSecret} />}
                </Form>
              </GridItem>
            </Grid>
          </>
        );
        const footer = (
          <ClusterWizardFooter
            cluster={cluster}
            errorFields={errorFields}
            isSubmitting={isSubmitting}
            isNextDisabled={
              // TODO(mlibra): make it flexible for the future ClusterDeployment edit-flow (good-enought for the recent create-only flow)
              !(
                !isSubmitting &&
                isValid &&
                (dirty || (cluster && canNextClusterDetails({ cluster })))
              )
            }
            onNext={handleOnNext(dirty, submitForm, cluster)}
          />
        );
        return (
          <ClusterWizardStep navigation={navigation} footer={footer}>
            {form}
          </ClusterWizardStep>
        );
      }}
    </Formik>
  );
};

export default ClusterDetailsForm;
