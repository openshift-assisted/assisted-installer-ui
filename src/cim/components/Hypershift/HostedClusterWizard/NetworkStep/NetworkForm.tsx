import * as React from 'react';
import cidrTools from 'cidr-tools';
import { NetworkFormProps, NetworkFormValues } from './types';
import flattenDeep from 'lodash/flattenDeep';
import xor from 'lodash/xor';
import { Form, FormGroup, Grid, GridItem } from '@patternfly/react-core';
import { useFormikContext } from 'formik';
import {
  CheckboxField,
  getHumanizedSubnet,
  getSubnet,
  InputField,
  Interface,
  NumberInputField,
  PopoverIcon,
  ProxyFields,
  RadioField,
  SelectField,
  UploadSSH,
} from '../../../../../common';
import { useTemptiflySync } from '../../hooks/useTemptiflySync';
import { useTranslation } from '../../../../../common/hooks/use-translation-wrapper';
import { AgentK8sResource } from '../../../../types';

import './NetworkForm.css';

const NetworkForm: React.FC<NetworkFormProps> = ({ agents, onValuesChanged }) => {
  const { values, setFieldValue } = useFormikContext<NetworkFormValues>();
  useTemptiflySync({ values, onValuesChanged });

  const allAgents: AgentK8sResource[] = agents.filter((a) => !!a.status?.inventory.interfaces);
  const allInterfacesDeep: (Interface[] | undefined)[] = allAgents.map(
    (a) => a.status?.inventory?.interfaces,
  );
  const allInterfaces: Interface[] = flattenDeep(allInterfacesDeep).filter(Boolean) as Interface[];
  const allIpsRaw: string[][] = allInterfaces.map((i: Interface): string[] => [
    ...(i.ipv4Addresses || []),
    ...(i.ipv6Addresses || []),
  ]);
  const allIps: string[] = flattenDeep<string>(allIpsRaw);

  const agentCIDRs = allIps.map((ip) => cidrTools.merge([ip][0]));

  const cidrToAgentsMapping = agentCIDRs.reduce((acc, curr) => {
    acc[curr.toString()] = [];
    return acc;
  }, {} as { [key: string]: string[] });

  agents.forEach((agent) => {
    agentCIDRs.forEach((cidr) => {
      if (allIps.some((ipAddr) => cidrTools.overlap(ipAddr, cidr))) {
        cidrToAgentsMapping[cidr.toString()] = [
          ...(cidrToAgentsMapping[cidr.toString()] || []),
          agent.metadata?.uid || '',
        ];
      }
    });
  });

  const uids = agents.map((a) => a.metadata?.uid);

  const availableCIDRs = Object.keys(cidrToAgentsMapping).filter(
    (key) => xor(cidrToAgentsMapping[key], uids).length === 0,
  );

  const cidrOptions = availableCIDRs.map((cidr) => {
    return {
      value: cidr,
      label: getHumanizedSubnet(getSubnet(cidr)),
    };
  });

  React.useEffect(() => {
    if (values.machineCIDR === '' && availableCIDRs.length) {
      setFieldValue('machineCIDR', availableCIDRs[0]);
    }
  }, [setFieldValue, availableCIDRs, values.machineCIDR]);
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
      <SelectField label={t('ai:Machine CIDR')} name="machineCIDR" options={cidrOptions} />
      <CheckboxField
        name="isAdvanced"
        label={t('ai:Use advanced networking')}
        className="ai-advanced-fields"
        body={
          values.isAdvanced && (
            <Grid hasGutter>
              <GridItem>
                <InputField name="podCIDR" label={t('ai:Cluster CIDR')} />
              </GridItem>
              <GridItem>
                <InputField name="serviceCIDR" label={t('ai:Service CIDR')} />
              </GridItem>
            </Grid>
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
