import * as Yup from 'yup';
import { ArrayElementType, macAddressValidationSchema } from '../../../../../../common';
import { YamlViewValues } from '../../data/dataTypes';
import {
  getUniqueValidationSchema,
  UniqueStringArrayExtractor,
} from '../../commonValidationSchemas';
import {
  INCORRECT_TYPE_FILE_MESSAGE,
  getMaxFileSizeMessage,
  validateFileSize,
  validateFileType,
} from '../../../../../../common/utils';
import {
  HostStaticNetworkConfig,
  MacInterfaceMap,
} from '@openshift-assisted/types/assisted-installer-service';

const requiredMsg = 'A value is required';

const networkYamlValidationSchema = Yup.string()
  .required(requiredMsg)
  .test('file-size-limit', getMaxFileSizeMessage, validateFileSize)
  .test('file-type-yaml', INCORRECT_TYPE_FILE_MESSAGE, validateFileType);

const getAllMacAddresses: UniqueStringArrayExtractor<YamlViewValues> = (
  values: YamlViewValues,
): string[] => {
  const allMacAddresses: string[] = [];
  for (const host of values.hosts) {
    if (!host.macInterfaceMap) {
      continue;
    }
    for (const mapItem of host.macInterfaceMap) {
      if (mapItem.macAddress) {
        allMacAddresses.push(mapItem.macAddress);
      }
    }
  }
  return allMacAddresses;
};

const getInterfaceNamesInCurrentHost: UniqueStringArrayExtractor<YamlViewValues> = (
  values: YamlViewValues,
  context: Yup.TestContext,
) => {
  const currentMacInterfaceObject: ArrayElementType<MacInterfaceMap> =
    context.parent as unknown as ArrayElementType<MacInterfaceMap>;
  const currentHost = values.hosts.find(
    (currentHost) =>
      currentHost.macInterfaceMap &&
      currentHost.macInterfaceMap.indexOf(currentMacInterfaceObject) > -1,
  );
  if (!currentHost || !currentHost.macInterfaceMap) {
    return undefined;
  }
  return currentHost.macInterfaceMap.map((currentItem) => {
    return currentItem.logicalNicName ? currentItem.logicalNicName : '';
  });
};

const macInterfaceMapValidationSchema = Yup.array<MacInterfaceMap>().of(
  Yup.object({
    macAddress: macAddressValidationSchema
      .required(requiredMsg)
      .concat(getUniqueValidationSchema(getAllMacAddresses)),
    logicalNicName: Yup.string()
      .required(requiredMsg)
      .concat(getUniqueValidationSchema(getInterfaceNamesInCurrentHost))
      .max(15, 'Interface name must be 15 characters at most.')
      .matches(/^\S+$/, 'Interface name can not contain spaces.'),
  }),
);

export const yamlViewValidationSchema = Yup.object({
  hosts: Yup.array<HostStaticNetworkConfig>().of(
    Yup.object().shape({
      networkYaml: networkYamlValidationSchema,
      macInterfaceMap: macInterfaceMapValidationSchema,
    }),
  ),
});
