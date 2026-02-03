import * as Yup from 'yup';
import {
  ArrayElementType,
  getIncorrectFileTypeMessage,
  macAddressValidationSchema,
} from '../../../../../../common';
import { YamlViewValues } from '../../data/dataTypes';
import {
  getUniqueValidationSchema,
  UniqueStringArrayExtractor,
} from '../../commonValidationSchemas';
import {
  getMaxFileSizeMessage,
  validateFileSize,
  validateFileType,
} from '../../../../../../common/utils';
import {
  HostStaticNetworkConfig,
  MacInterfaceMap,
} from '@openshift-assisted/types/assisted-installer-service';
import { TFunction } from 'i18next';

const networkYamlValidationSchema = (t: TFunction) =>
  Yup.string()
    .required('Required field')
    .test('file-size-limit', getMaxFileSizeMessage(t), validateFileSize)
    .test('file-type-yaml', getIncorrectFileTypeMessage(t), validateFileType);

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

const macInterfaceMapValidationSchema = (t: TFunction) =>
  Yup.array<MacInterfaceMap>().of(
    Yup.object({
      macAddress: macAddressValidationSchema(t)
        .required('Required field')
        .concat(getUniqueValidationSchema(getAllMacAddresses)),
      logicalNicName: Yup.string()
        .required('Required field')
        .concat(getUniqueValidationSchema(getInterfaceNamesInCurrentHost))
        .max(15, 'Interface name must be 15 characters at most.')
        .matches(/^\S+$/, 'Interface name can not contain spaces.'),
    }),
  );

export const yamlViewValidationSchema = (t: TFunction) =>
  Yup.object({
    hosts: Yup.array<HostStaticNetworkConfig>().of(
      Yup.object().shape({
        networkYaml: networkYamlValidationSchema(t),
        macInterfaceMap: macInterfaceMapValidationSchema(t),
      }),
    ),
  });
