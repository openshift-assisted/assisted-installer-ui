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
    const uniqueOps = new Set([...currentOperators, ...dependencies, operatorId]);
    return Array.from(uniqueOps);
  }

  const newOperators = currentOperators.filter((op) => op !== operatorId);
  const notStandaloneDeps = dependencies
    .filter((dep) => opSpecs[dep]?.notStandalone)
    .filter((dep) => {
      const hasDependency = newOperators.some((op) =>
        getOperatorDependencies(op, preflightRequirements).includes(dep),
      );
      if (!hasDependency) {
        newOperators.splice(newOperators.indexOf(dep), 1);
      }
      return !hasDependency;
    });

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
  return Array.from(bundleOperators);
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
    const combined = [...currentOperators, ...newBundleOperators];
    return Array.from(new Set(combined));
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
