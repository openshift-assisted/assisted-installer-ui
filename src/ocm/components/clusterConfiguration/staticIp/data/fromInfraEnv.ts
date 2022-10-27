import { HostStaticNetworkConfig, InfraEnv, stringToJSON } from '../../../../../common';
import { FORM_VIEW_PREFIX, getProtocolType, getYamlComments } from './nmstateYaml';
import {
  StaticIpInfo,
  StaticIpView,
  StaticFormData,
  FormViewHostsValues,
  FormViewNetworkWideValues,
  YamlViewValues,
} from './dataTypes';
import { getDummyInfraEnvField, isDummyYaml } from './dummyData';
import { formDataFromInfraEnvField } from './formDataFromInfraEnvField';
import { getEmptyFormViewHost } from './emptyData';

export const getStaticNetworkConfig = (
  infraEnv: InfraEnv,
): HostStaticNetworkConfig[] | undefined => {
  if (!infraEnv.staticNetworkConfig || !infraEnv.staticNetworkConfig.length) {
    return undefined;
  }
  const staticNetworkConfig = stringToJSON<HostStaticNetworkConfig[]>(infraEnv.staticNetworkConfig);
  if (!staticNetworkConfig) {
    throw `Failed to parse static network config`;
  }
  if (!staticNetworkConfig.length) {
    return undefined;
  }
  return staticNetworkConfig;
};

const getView = (yamlComments: string[]): StaticIpView => {
  return yamlComments.includes(FORM_VIEW_PREFIX) ? StaticIpView.FORM : StaticIpView.YAML;
};

export const getStaticIpInfoFromInfraEnvField = (
  staticNetworkConfig: HostStaticNetworkConfig[],
) => {
  const firstNetworkYaml = staticNetworkConfig[0].networkYaml;
  if (!firstNetworkYaml) {
    throw `Static Network Config doesn't contain a network yaml`;
  }
  const comments = getYamlComments(firstNetworkYaml);
  return {
    view: getView(comments),
    isDataComplete: !isDummyYaml(firstNetworkYaml),
    formViewProtocolType: getProtocolType(comments),
  };
};

export const getStaticIpInfo = (infraEnv: InfraEnv): StaticIpInfo | undefined => {
  const staticNetworkConfig = getStaticNetworkConfig(infraEnv);
  if (!staticNetworkConfig || !staticNetworkConfig[0]) {
    return undefined;
  }
  return getStaticIpInfoFromInfraEnvField(staticNetworkConfig);
};

export const getOrCreateStaticIpInfo = (infraEnv: InfraEnv): StaticIpInfo | undefined => {
  const staticNetworkConfig = getStaticIpInfo(infraEnv);
  return staticNetworkConfig || getStaticIpInfoFromInfraEnvField(getDummyInfraEnvField());
};

//Fails if form data doesn't exist
export const getFormData = (
  staticNetworkConfig: HostStaticNetworkConfig[] | undefined,
): StaticFormData => {
  if (!staticNetworkConfig) {
    throw `Infra env doesn't contain static ip data`;
  }
  const formData = formDataFromInfraEnvField(staticNetworkConfig);
  if (!formData) {
    throw `Failed to get static ip form data from infra env`;
  }
  return formData;
};

export const getFormViewHostsValues = (infraEnv: InfraEnv): FormViewHostsValues => {
  const staticNetworkConfig = getStaticNetworkConfig(infraEnv);
  const formData = getFormData(staticNetworkConfig);
  if (!formData.hosts.length) {
    return { hosts: [getEmptyFormViewHost()] };
  }
  return { hosts: formData.hosts };
};

export const getFormViewNetworkWideValues = (infraEnv: InfraEnv): FormViewNetworkWideValues => {
  const staticNetworkConfig = getStaticNetworkConfig(infraEnv);
  return getFormData(staticNetworkConfig).networkWide;
};

export const getYamlViewValues = (infraEnv: InfraEnv): YamlViewValues => {
  const staticNetworkConfig = getStaticNetworkConfig(infraEnv);
  if (!staticNetworkConfig) {
    throw `Infra env doesn't contain static ip data`;
  }
  return { hosts: staticNetworkConfig };
};
