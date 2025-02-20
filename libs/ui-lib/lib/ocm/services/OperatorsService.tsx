import {
  OperatorsValues,
  OPERATOR_NAME_CNV,
  OPERATOR_NAME_ODF,
  OPERATOR_NAME_LSO,
  OPERATOR_NAME_LVM,
  OperatorName,
  OPERATOR_NAME_MCE,
  OPERATOR_NAME_MTV,
  OPERATOR_NAME_OPENSHIFT_AI,
  OPERATOR_NAME_OSC,
  OPERATOR_NAME_NODE_FEATURE_DISCOVERY,
  OPERATOR_NAME_NMSTATE,
  OPERATOR_NAME_SERVERLESS,
  OPERATOR_NAME_AUTHORINO,
  OPERATOR_NAME_PIPELINES,
  OPERATOR_NAME_SERVICEMESH,
  OPERATOR_NAME_NVIDIA_GPU,
} from '../../common';
import { getOlmOperatorCreateParamsByName } from '../components/clusters/utils';
import {
  Cluster,
  OperatorCreateParams,
} from '@openshift-assisted/types/assisted-installer-service';
import OperatorsAPI from '../../common/api/assisted-service/OperatorsAPI';

const OperatorsService = {
  getOLMOperators(values: OperatorsValues, cluster: Cluster): OperatorCreateParams[] {
    const enabledOlmOperatorsByName = getOlmOperatorCreateParamsByName(cluster);

    // TODO: change OperatorName to ExposedOperatorName once the LSO option is exposed to the user
    const setOperator = (name: OperatorName, enabled: boolean) => {
      if (enabled) {
        enabledOlmOperatorsByName[name] = { name };
      } else {
        delete enabledOlmOperatorsByName[name];
      }
    };

    setOperator(OPERATOR_NAME_LVM, values.useOdfLogicalVolumeManager);
    setOperator(OPERATOR_NAME_CNV, values.useContainerNativeVirtualization);
    setOperator(OPERATOR_NAME_ODF, values.useOpenShiftDataFoundation);
    setOperator(OPERATOR_NAME_MCE, values.useMultiClusterEngine);
    setOperator(OPERATOR_NAME_MTV, values.useMigrationToolkitforVirtualization);
    setOperator(OPERATOR_NAME_OPENSHIFT_AI, values.useOpenShiftAI);
    setOperator(OPERATOR_NAME_OSC, values.useOsc);
    setOperator(OPERATOR_NAME_NODE_FEATURE_DISCOVERY, values.useNodeFeatureDiscovery);
    setOperator(OPERATOR_NAME_NMSTATE, values.useNmstate);
    setOperator(OPERATOR_NAME_LSO, values.useLso);
    setOperator(OPERATOR_NAME_SERVERLESS, values.useServerless);
    setOperator(OPERATOR_NAME_AUTHORINO, values.useAuthorino);
    setOperator(OPERATOR_NAME_PIPELINES, values.usePipelines);
    setOperator(OPERATOR_NAME_SERVICEMESH, values.useServicemesh);
    setOperator(OPERATOR_NAME_NVIDIA_GPU, values.useNvidiaGpu);

    return Object.values(enabledOlmOperatorsByName);
  },

  /**
   * Depending on the Openshift version and certain selected operators, the
   * Backend can activate some other operators.
   * We need to synchronise them back to the form
   */
  syncOperators(
    uiOperators: OperatorCreateParams[],
    updatedOperators: Cluster['monitoredOperators'],
  ): Partial<OperatorsValues> {
    const updates: Partial<OperatorsValues> = {};

    // LVM operator can be automatically selected depending on Openshift version + other operators
    const lvmPrevInactive = uiOperators?.find((op) => op.name === OPERATOR_NAME_LVM) === undefined;
    const lvmNowActive =
      updatedOperators?.find((op) => op.name === OPERATOR_NAME_LVM) !== undefined;
    if (lvmPrevInactive && lvmNowActive) {
      updates.useOdfLogicalVolumeManager = true;
    }

    // ODF operator will be automatically selected when the OpenShift AI operator is selected:
    const odfPrevInactive = uiOperators?.find((op) => op.name === OPERATOR_NAME_ODF) === undefined;
    const odfNowActive =
      updatedOperators?.find((op) => op.name === OPERATOR_NAME_ODF) !== undefined;
    if (odfPrevInactive && odfNowActive) {
      updates.useOpenShiftDataFoundation = true;
    }

    return updates;
  },

  async getSupportedOperators(): Promise<string[]> {
    const { data: operators } = await OperatorsAPI.list();
    return operators;
  },
};
export default OperatorsService;
