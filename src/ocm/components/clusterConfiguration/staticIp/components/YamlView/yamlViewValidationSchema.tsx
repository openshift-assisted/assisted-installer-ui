import * as Yup from 'yup';
import {
  HostStaticNetworkConfig,
  macAddressValidationSchema,
  MacInterfaceMap,
} from '../../../../../../common';
import { YamlViewValues } from '../../data/dataTypes';
import filter from 'lodash/filter';

const uniqueMessage = 'must be unique';
const requiredMsg = 'A value is required';
const networkYamlValidationSchema = Yup.string().required(requiredMsg);

const testUnique = (value: string, values: object[], field: string): boolean => {
  if (!value) {
    return true;
  }
  return filter(values, { [field]: value }).length === 1;
};

const macInterfaceMapValidationSchema = Yup.lazy<MacInterfaceMap>((macInterfaceMap) => {
  return Yup.array<MacInterfaceMap>().of(
    Yup.object().shape({
      macAddress: macAddressValidationSchema
        .required(requiredMsg)
        .test('macAddress', uniqueMessage, (value) =>
          testUnique(value, macInterfaceMap, 'macAddress'),
        ),
      logicalNicName: Yup.string()
        .required(requiredMsg)
        .test('logicalNicName', uniqueMessage, (value) =>
          testUnique(value, macInterfaceMap, 'logicalNicName'),
        ),
    }),
  );
});

export const yamlViewValidationSchema = Yup.object().shape<YamlViewValues>({
  hosts: Yup.array<HostStaticNetworkConfig>().of(
    Yup.object().shape({
      networkYaml: networkYamlValidationSchema,
      macInterfaceMap: macInterfaceMapValidationSchema,
    }),
  ),
});
