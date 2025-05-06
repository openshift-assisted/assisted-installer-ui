import React from 'react';
import { ContentVariants, Content, FormGroup, Grid } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';
import { Language } from '@patternfly/react-code-editor';
import { useField } from 'formik';
import { getFieldId, NMSTATE_EXAMPLES_LINK, PopoverIcon } from '../../../../../../common';
import StaticIpHostsArray, { HostComponentProps } from '../StaticIpHostsArray';
import HostSummary from '../CollapsedHost';
import { MacIpMapping } from './MacIpMapping';
import { getEmptyYamlHost } from '../../data/emptyData';
import { OcmCodeField } from '../../../../ui/OcmFormFields';
import { HostStaticNetworkConfig } from '@openshift-assisted/types/assisted-installer-service';

const CollapsedHost: React.FC<HostComponentProps> = ({ fieldName, hostIdx }) => {
  const mapFieldName = `${fieldName}.macInterfaceMap`;
  const [mapField, { error }] = useField<HostStaticNetworkConfig['macInterfaceMap']>({
    name: mapFieldName,
  });
  const macInterfaceMap = mapField.value ? mapField.value : [];
  let hasError = !!error;
  let macAddress = '';
  let mapValue = '';
  if (!macInterfaceMap.length) {
    hasError = true;
  } else {
    macAddress = macInterfaceMap[0].macAddress || '';
    mapValue = macInterfaceMap[0].logicalNicName || '';
  }
  return (
    <HostSummary
      title="MAC to Interface name mapping"
      numInterfaces={macInterfaceMap.length}
      macAddress={macAddress}
      mappingValue={mapValue}
      hostIdx={hostIdx}
      hasError={hasError}
      bondPrimaryInterface=""
      bondSecondaryInterface=""
    />
  );
};

const ExpandedHost: React.FC<HostComponentProps> = ({ fieldName, hostIdx }) => {
  const mapFieldName = `${fieldName}.macInterfaceMap`;
  const [mapField] = useField<HostStaticNetworkConfig['macInterfaceMap']>({
    name: mapFieldName,
  });
  const macInterfaceMap = mapField.value ? mapField.value : [];

  return (
    <>
      <FormGroup label="" fieldId={getFieldId('nmstateYaml', 'inputs')}>
        <OcmCodeField
          language={Language.yaml}
          name={`${fieldName}.networkYaml`}
          data-testid={`yaml-${hostIdx}`}
        />
      </FormGroup>
      <FormGroup
        label={
          <>
            MAC to interface name mapping{' '}
            <PopoverIcon
              bodyContent={
                'MAC address and interface name are needed in order to execute the above nmstate YAML on the right machine.'
              }
            />
          </>
        }
        fieldId={getFieldId('macNicMaping', 'inputs')}
      >
        <MacIpMapping
          fieldName={mapFieldName}
          macInterfaceMap={macInterfaceMap}
          hostIdx={hostIdx}
        />
      </FormGroup>
    </>
  );
};

export const YamlViewFields = () => {
  const emptyHostData = getEmptyYamlHost();
  return (
    <Grid hasGutter>
      <Content>
        <Content component={ContentVariants.small}>
          Upload, drag and drop, or copy and paste a YAML file that contains NMState into the editor
          for network configurations. Each host also needs the MAC to interface name mapping.{' '}
          <a href={NMSTATE_EXAMPLES_LINK} target="_blank" rel="noopener noreferrer">
            Learn more about NMState <ExternalLinkAltIcon />
          </a>
        </Content>
      </Content>

      <StaticIpHostsArray<HostStaticNetworkConfig>
        ExpandedHostComponent={ExpandedHost}
        CollapsedHostComponent={CollapsedHost}
        emptyHostData={emptyHostData}
        enableCopyAboveConfiguration={true}
      />
    </Grid>
  );
};
