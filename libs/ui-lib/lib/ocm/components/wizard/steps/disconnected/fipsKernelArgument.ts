import { InfraEnv, KernelArguments } from '@openshift-assisted/types/assisted-installer-service';

// FIPS for the disconnected (OVE) ISO is requested by adding fips=1 to the
// InfraEnv's kernel arguments. assisted-image-service applies InfraEnv kernel
// arguments to the ISO as it serves it, so the rendezvous node boots in FIPS mode
// and the on-premise assisted-service then installs a FIPS cluster on its own.
// Nothing else needs to be told about FIPS. (AGENT-1652 / AGENT-1653)
const FIPS_KERNEL_ARGUMENT = 'fips=1';

// GET returns kernelArguments as a JSON-encoded string, while update takes an array.
const parseKernelArguments = (infraEnv?: InfraEnv): KernelArguments => {
  if (!infraEnv?.kernelArguments) {
    return [];
  }
  try {
    const parsed = JSON.parse(infraEnv.kernelArguments) as unknown;
    return Array.isArray(parsed) ? (parsed as KernelArguments) : [];
  } catch {
    return [];
  }
};

const isFipsKernelArgument = (karg: KernelArguments[number]) =>
  karg.operation === 'append' && karg.value === FIPS_KERNEL_ARGUMENT;

export const isFipsEnabled = (infraEnv?: InfraEnv): boolean =>
  parseKernelArguments(infraEnv).some(isFipsKernelArgument);

// An update replaces the whole kernel argument list, so keep any other arguments
// already on the InfraEnv and only add or remove fips=1.
export const getKernelArgumentsWithFips = (
  infraEnv: InfraEnv | undefined,
  enableFips: boolean,
): KernelArguments => {
  const others = parseKernelArguments(infraEnv).filter((karg) => !isFipsKernelArgument(karg));
  return enableFips ? [...others, { operation: 'append', value: FIPS_KERNEL_ARGUMENT }] : others;
};
