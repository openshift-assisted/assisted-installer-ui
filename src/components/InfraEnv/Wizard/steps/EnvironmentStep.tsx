import * as React from 'react';
import { Button, Form, Grid, GridItem, Title, TitleSizes } from '@patternfly/react-core';

import ProxyFields from '../../../clusterConfiguration/ProxyFields';
import UploadSSH from '../../../clusterConfiguration/UploadSSH';
import { InputField, TextAreaField } from '../../../ui';
import LabelField from '../../../ui/formik/LabelField';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { FieldArray, useFormikContext } from 'formik';
import { EnvironmentStepFormValues } from '../types';
import ConfigureNetworkModal from './ConfigureNetworkModal';
import { getNMStateTemplate } from '../utils';

const EnvironmentStep: React.FC = () => {
  const [configureMac, setConfigureMac] = React.useState<number | undefined>();
  const { values, setFieldValue } = useFormikContext<EnvironmentStepFormValues>();
  return (
    <>
      <Grid hasGutter span={8}>
        <GridItem>
          <Title headingLevel="h1" size={TitleSizes.lg}>
            Configure environment
          </Title>
        </GridItem>
        <GridItem>
          Infrastructure Environments are used by Clusters. Create an Infrastructure Environment in
          order to add resources to your cluster
        </GridItem>
        <GridItem>
          <Form>
            <InputField label="Name" name="name" isRequired />
            <InputField label="Base domain" name="baseDomain" isRequired />
            <InputField label="Location" name="location" isRequired />
            <FieldArray
              name="networks"
              render={(arrayHelpers) => {
                return (
                  <>
                    {values.networks.map((network, index) => {
                      return (
                        <InputField
                          key={`mac-${index}`}
                          label="MAC Address"
                          name={`networks.${index}.mac`}
                        >
                          <Button
                            variant="link"
                            icon={<PlusCircleIcon />}
                            onClick={() => setConfigureMac(index)}
                          >
                            Configure
                          </Button>
                        </InputField>
                      );
                    })}
                    <div>
                      <Button
                        variant="link"
                        icon={<PlusCircleIcon />}
                        onClick={() =>
                          arrayHelpers.push({ mac: '', config: getNMStateTemplate('') })
                        }
                      >
                        Add configuration
                      </Button>
                    </div>
                  </>
                );
              }}
            />
            <LabelField label="Labels" name="labels" isRequired />
            <TextAreaField label="Pull secret" name="pullSecret" isRequired />
            <UploadSSH />
            <ProxyFields />
          </Form>
        </GridItem>
      </Grid>
      <ConfigureNetworkModal
        isOpen={configureMac !== undefined}
        config={configureMac !== undefined ? values.networks[configureMac].config : undefined}
        close={(config) => {
          if (configureMac !== undefined) {
            const newNetworks = [...values.networks];
            newNetworks[configureMac].config = config || '';
            setFieldValue('networks', newNetworks);
          }
          setConfigureMac(undefined);
        }}
      />
    </>
  );
};

export default EnvironmentStep;
