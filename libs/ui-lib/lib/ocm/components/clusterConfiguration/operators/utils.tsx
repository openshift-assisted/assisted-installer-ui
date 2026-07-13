import {
  BundleCreateParams,
  Bundle,
  PreflightHardwareRequirements,
} from '@openshift-assisted/types/assisted-installer-service';
export const getOperatorDependencies = (
  operatorId: string,
  preflightRequirements: PreflightHardwareRequirements | undefined,
  dependencies: Set<string> = new Set(),
) => {
  const originalSize = dependencies.size;
  const deps =
    preflightRequirements?.operators?.find(({ operatorName }) => operatorName === operatorId)
      ?.dependencies || [];

  deps.forEach((dep) => dependencies.add(dep));

  if (originalSize !== dependencies.size) {
    // add deps of new deps
    deps.forEach((op) => {
      getOperatorDependencies(op, preflightRequirements, dependencies);
    });
  }
  return [...dependencies];
};

const getBundleOperators = (
  bundle: Bundle,
  preflightRequirements: PreflightHardwareRequirements | undefined,
) => {
  const bundleOperators = new Set(bundle.operators || []);
  bundle.operators?.forEach((op) => {
    getOperatorDependencies(op, preflightRequirements).forEach((dep) => bundleOperators.add(dep));
  });
  return Array.from(bundleOperators);
};

export const getNewBundleOperators = (
  currentOperators: string[],
  currentBundles: BundleCreateParams[],
  allBundles: Bundle[],
  newBundle: Bundle,
  preflightRequirements: PreflightHardwareRequirements | undefined,
  add: boolean,
): string[] => {
  const newBundleOperators = getBundleOperators(newBundle, preflightRequirements);

  if (add) {
    const combined = [...currentOperators, ...newBundleOperators];
    return Array.from(new Set(combined));
  }

  const newBundles = currentBundles.filter((bundle) => bundle.id !== newBundle.id);
  const operatorsToKeep = [
    ...newBundles.reduce((acc, selectedBundle) => {
      const bundle = allBundles.find(({ id }) => id === selectedBundle.id);
      if (bundle) {
        const bundleOperators = getBundleOperators(bundle, preflightRequirements);
        bundleOperators.forEach((op) => {
          acc.add(op);
        });
      }
      return acc;
    }, new Set<string>()),
  ];

  const operatorsToRemove = newBundleOperators.filter((op) => !operatorsToKeep.includes(op));

  return currentOperators.filter((op) => !operatorsToRemove.includes(op));
};

const operatorPropertyLabels: Record<string, Record<string, string>> = {
  'network-observability': {
    createFlowCollector: 'Create FlowCollector',
    sampling: 'Sampling rate',
  },
};

const formatPropertyName = (propertyName: string): string =>
  propertyName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase())
    .trim();

export const getOperatorPropertyLabel = (operatorId: string, propertyName: string): string =>
  operatorPropertyLabels[operatorId]?.[propertyName] ?? formatPropertyName(propertyName);
