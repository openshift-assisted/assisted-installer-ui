import * as React from 'react';
import { NetworkFormProps, NetworkFormValues } from './types';
import { Form, FormGroup, Grid, GridItem } from '@patternfly/react-core';
import { useFormikContext } from 'formik';
import { Address6 } from 'ip-address';
import {
  CheckboxField,
  InputField,
  NumberInputField,
  PopoverIcon,
  ProxyFields,
  RadioField,
  UploadSSH,
} from '../../../../../common';
import { useTemptiflySync } from '../../hooks/useTemptiflySync';
import { useTranslation } from '../../../../../common/hooks/use-translation-wrapper';

import './NetworkForm.css';
import AdvancedNetworkFields from '../../../../../common/components/clusterConfiguration/AdvancedNetworkFields';

const NetworkForm: React.FC<NetworkFormProps> = ({ onValuesChanged }) => {
  const { values } = useFormikContext<NetworkFormValues>();
  useTemptiflySync({ values, onValuesChanged });

  const isClusterCIDRIPv6 = Address6.isValid(values.clusterNetworkCidr || '');

  const { t } = useTranslation();
  return (
    <Form>
      <FormGroup label={t('ai:API server publishing strategy')}>
        <Grid hasGutter>
          <GridItem>
            <RadioField
              name="apiPublishingStrategy"
              label="LoadBalancer"
              value="LoadBalancer"
              description={t(
                `ai:Exposes the service externally using a cloud provider's load balancer`,
              )}
            />
          </GridItem>
          <GridItem>
            <RadioField
              name="apiPublishingStrategy"
              label="NodePort"
              value="NodePort"
              className="ai-nodeport-fields"
              description={t(`ai:Exposes the service on each node's IP at a static port`)}
              body={
                values.apiPublishingStrategy === 'NodePort' && (
                  <Grid hasGutter>
                    <GridItem>
                      <InputField
                        isRequired
                        name="nodePortAddress"
                        label={t('ai:Host address')}
                        labelIcon={
                          <PopoverIcon
                            position="right"
                            bodyContent={t(
                              'ai:Address is the host/ip that the NodePort service is exposed over.',
                            )}
                          />
                        }
                      />
                    </GridItem>
                    <GridItem>
                      <NumberInputField
                        label={t('ai:Host port')}
                        idPostfix="nodePortPort"
                        name="nodePortPort"
                        minValue={0}
                        maxValue={65535}
                        labelIcon={
                          <PopoverIcon
                            position="right"
                            bodyContent={t(
                              'ai:Port of the NodePort service. If set to 0, the port is dynamically assigned when the service is created.',
                            )}
                          />
                        }
                      />
                    </GridItem>
                  </Grid>
                )
              }
            />
          </GridItem>
        </Grid>
      </FormGroup>
      <CheckboxField
        name="isAdvanced"
        label={t('ai:Use advanced networking')}
        className="ai-advanced-fields"
        body={
          values.isAdvanced && (
            <AdvancedNetworkFields isSDNSelectable={false} isClusterCIDRIPv6={isClusterCIDRIPv6} />
          )
        }
        helperText={t('ai:Configure advanced networking properties (e.g. CIDR ranges).')}
      />
      <ProxyFields />
      <UploadSSH isRequired />
    </Form>
  );
};

export default NetworkForm;
