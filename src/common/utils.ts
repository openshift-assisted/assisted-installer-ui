const MIN_OCP_VERSION = '4.11.0';

export const canAddHostSNO = (ocpVersion: string, minVersion: string = MIN_OCP_VERSION) => {
  const ocpVersionSplit = ocpVersion.match(/\d+(\.\d+)+/);
  if (ocpVersionSplit?.length) {
    const ocpVersionParsed = ocpVersionSplit[0].split('.').map((num) => Number(num)) || [-1];
    const minVersionParsed = minVersion.split('.').map((num) => Number(num));

    return ocpVersionParsed.every((v, i) => v >= minVersionParsed[i]);
  }
  return false;
};
