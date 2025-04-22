import {
  Bundle,
  PreflightHardwareRequirements,
} from '@openshift-assisted/types/assisted-installer-service';
import { OperatorSpec } from '../../../../common/components/operators/operatorSpecs';

const getOperatorDependencies = (
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

export const getNewOperators = (
  currentOperators: string[],
  operatorId: string,
  preflightRequirements: PreflightHardwareRequirements | undefined,
  add: boolean,
  opSpecs: { [key: string]: OperatorSpec },
): string[] => {
  const dependencies = getOperatorDependencies(operatorId, preflightRequirements);

  if (add) {
    return [...new Set([...currentOperators, ...dependencies, operatorId])];
  }

  const newOperators = currentOperators.filter((op) => op !== operatorId);
  // uncheck unneeded not-standalone dependencies too
  const notStandaloneDeps = dependencies
    .filter((dep) => opSpecs[dep]?.notStandalone)
    .filter((dep) =>
      // some other operator may still depend on the not-standalone operator
      newOperators.every((op) => !getOperatorDependencies(op, preflightRequirements).includes(dep)),
    );

  return currentOperators.filter((op) => op !== operatorId && !notStandaloneDeps.includes(op));
};

const getBundleOperators = (
  bundle: Bundle,
  preflightRequirements: PreflightHardwareRequirements | undefined,
) => {
  const bundleOperators = new Set(bundle.operators || []);
  bundle.operators?.forEach((op) => {
    getOperatorDependencies(op, preflightRequirements).forEach((dep) => bundleOperators.add(dep));
  });
  return [...bundleOperators];
};

export const getNewBundleOperators = (
  currentOperators: string[],
  currentBundles: string[],
  allBundles: Bundle[],
  newBundle: Bundle,
  preflightRequirements: PreflightHardwareRequirements | undefined,
  add: boolean,
): string[] => {
  const newBundleOperators = getBundleOperators(newBundle, preflightRequirements);

  if (add) {
    return [...new Set([...currentOperators, ...newBundleOperators])];
  }

  const newBundles = currentBundles.filter((b) => b !== newBundle.id);
  const operatorsToKeep = [
    ...newBundles.reduce((acc, bundleId) => {
      const bundle = allBundles.find(({ id }) => id === bundleId);
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
